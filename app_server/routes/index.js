/* eslint-env node es6*/

'use strict';

const express = require('express');
const router = express.Router();
const ctrlLocations = require('../controllers/locations');
var ioHolder;
const forecastApi = require('../clients/pa/forecast-api');
var yahooClient = require('../clients/yahoo-client');
var fredClient = require('../clients/fred-client');
var logger = require('../utils/log4js-log-util').getLogger('routes');
var fs = require('fs');
var numbers = require('numbers');
const config = require('../../config');
var PAClient = require('../clients/pa/pa-client');

let paClient = new PAClient(_getPMEnvironment());

function _getPMEnvironment() {
  return config('pm-20').credentials;
}

const clients = {
  yh: yahooClient,
  fr: fredClient
  // ut - reserved for user provided tickers
};

function Ticker(name, clientTags) {
  this.name = name;
  this.clientTags = clientTags;
}

function _extractTickers(tickersList, clientTags) {
  try {
    let tickersAsArr = tickersList.split(',');
    let result = tickersAsArr.map(function (val) {
      return new Ticker(val, clientTags);
    });
    return result;
  } catch (err) {
    return [];
  }
}

function _downloadDataForTicker(ticker, startDate, endDate) {
  function _handleDownloadFunction(callback) {
    return function (error, data) {
      if (!error) {
        // counting logReturn
        var i;
        var logReturn = [];
        var allLogReturnValues = [];
        for (i = 1; i < data.length; ++i) {
          var value = Math.log(data[i].Value) - Math.log(data[i - 1].Value);
          allLogReturnValues.push(value);
          logReturn.push({
            Date: data[i].Date,
            Value: value
          });
        }

        // counting statisticalSummary
        var allBasicValues = data.map(function (el) {
          return parseFloat(el.Value);
        });
        var summaryStatistics = {
          data: {
            mean: numbers.statistic.mean(allBasicValues),
            median: numbers.statistic.median(allBasicValues),
            mode: numbers.statistic.mode(allBasicValues),
            standardDev: numbers.statistic.standardDev(allBasicValues),
            min: Math.min(...allBasicValues),
            max: Math.max(...allBasicValues)
          },
          logReturn: {
            mean: numbers.statistic.mean(allLogReturnValues),
            median: numbers.statistic.median(allLogReturnValues),
            mode: numbers.statistic.mode(allLogReturnValues),
            standardDev: numbers.statistic.standardDev(allLogReturnValues),
            min: Math.min(...allLogReturnValues),
            max: Math.max(...allLogReturnValues)
          }
        };

        return callback(null, {
          data: data,
          logReturn: logReturn,
          summaryStatistics: summaryStatistics
        });
      }
      return callback(error);
    };
  }

  function requestDownload(index) {
    if (index === ticker.clientTags.length) return Promise.reject();

    return new Promise(
      function resolver(resolve, reject) {
        clients[ticker.clientTags[index]].downloadData(
          ticker.name, startDate, endDate,
            _handleDownloadFunction((err, retVal) => {
              if (!err) {
                let ctag = ticker.clientTags[index];
                retVal.ticker = ticker.name;
                retVal.source =  ctag,
                logger.debug(`${ctag} found data for ticker: ${ticker.name}`);
                resolve(retVal);
              } else {
                reject();
              }
            })
        );
      }
    )
    .then(function (data) {
      return Promise.resolve(data);
    })
    .catch(() => {
      return requestDownload(index + 1);
    });
  }
  return requestDownload(0);
}

/* GET home page. */
router.get('/', ctrlLocations.main);

router.get('/stockData', function (req, res) {
  logger.enter('/stockData', req.query);
  let tickers = [];
  Object.keys(clients).forEach(
    (key) => {
      tickers = tickers.concat(_extractTickers(req.query[key], [key]));
    });
  // user provided tickers should try with all services until one succeeds
  tickers = tickers.concat(_extractTickers(req.query.ut, Object.keys(clients)));

  let startDate = req.query.start;
  let endDate = req.query.end;

  let result = [];
  let errors = [];
  let warnings = [];

  if (typeof config('fred') === 'undefined' ||
    typeof config('fred').access_key === 'undefined' ||
    config('fred').access_key === '')
    warnings.push('No access key for FRED account found. This may result in data access errors. To add FRED access key please open \"Configuration\" tab from application menu.');

  tickers.forEach(function (ticker) {
    _downloadDataForTicker(ticker, startDate, endDate)
    .then((data) => {
      if (data.data.length > 0)
        result.push(data);
      else {
        logger.warn(`No data in specified range found for symbol: ${ticker.name}`);
        errors.push(`No data in specified range found for symbol: ${ticker.name}`);
      }
    })
    .catch(() => {
      logger.warn(`No data found for symbol: ${ticker.name}`);
      errors.push(`No data found for symbol: ${ticker.name}`);
    });
  });

  var intervalId = setInterval(function () {
    if (errors.length + result.length >= tickers.length) {
      clearInterval(intervalId);
      logger.return('/stockData');
      res.json({result: result, errors: errors, warnings: warnings});
    }
  }, 1000);
});

function _validateFormat(tableData) {
  if (Object.keys(tableData).length > 2)
    return false;

  if (tableData.DATE === 'DATE' && tableData.VALUE === 'DOUBLE')
    return true;
  else
    return false;
}

router.get('/modelsData', function (req, res) {
  paClient.getModels(function (errors, models) {
    var validModels = [];
    var warnings = [];
    models.forEach(function (modelData) {
      console.log(modelData.tableData.in);
      if (_validateFormat(modelData.tableData.in))
        validModels.push(modelData);
      else {
        warnings.push(`\"${modelData.id}\" model has incorrect format`);
      }
    });
    res.json({errors: errors, warnings: warnings, result: validModels});
  });
});

router.post('/score', function (req, res) {
  var socket;
  if (ioHolder) {
    logger.debug('socket io initialized');
    ioHolder.io.on('connection', function (preparedSocket) {
      if (!socket) {
        socket = preparedSocket;
        socket.emit('connected', {});
        logger.debug('connected with socket io client');
        socket.on('disconnect', function () {
          logger.debug('disconnected with socket io client');
        });
      }
    });
  } else {
    logger.warn('socket io is not initialized');
  }

  forecastApi.run(req.body.data, req.body.model,
    function (msg) {
      if (socket)
        socket.emit('info', msg);
      else
        console.log(msg);
    }, function (error, data) {
      res.json({errors: error, result: data});
    }
  );
});

router.get('/config', function (req, res) {
  fs.readFile('config/configurationPanel.json', 'utf8', function (err, data) {
    if (err) {
      res.json({});
      return;
    }
    if (data) {
      res.json(JSON.parse(data));
      return;
    } else {
      res.json({});
      return;
    }
  });
});

router.post('/config', function (req, res) {
  fs.writeFile('config/configurationPanel.json', JSON.stringify(req.body), function (err) {
    if (err) {
      logger.error(err);
      return;
    }
    config.refreshUserConfiguration();
    logger.info('User configuration refreshed');
    res.status(200).send();
  });
});

module.exports = function (passedIoHolder) {
  ioHolder = passedIoHolder;
  return router;
};
