'use strict';

var util = require('util');
var request = require('request');
var logger = require('../utils/log4js-log-util').getLogger('clients/yahoo-client');
var csv2json = require('../utils/csv2json-util');

function _downloadData(ticker, startDate, endDate, callback) {
  logger.enter(
    '_downloadData()',
    {ticker: ticker, startDate: startDate, endDate: endDate}
  );
  startDate = new Date(startDate);
  endDate = new Date(endDate);

  var url = util.format(
    'http://ichart.finance.yahoo.com/table.csv?s=%s&a=%d&b=%d&c=%d&d=%d&e=%d&f=%d&g=m&ignore=.csv',
    ticker,
    startDate.getMonth(),
    startDate.getDate(),
    startDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    endDate.getFullYear()
  );
  logger.debug('Request to yahoo service: ' + url);

  request(
    url,
    function (error, response, body) {
      if (error) {
        logger.warn(error);
        return callback(error);
      } else if (response.statusCode >= 200 && response.statusCode < 300) {
        var jsonData = csv2json.translate(body);
        var finalData = jsonData.map(function (dataPiece) {
          return {
            Date: dataPiece.Date,
            Value: dataPiece['Adj Close']
          };
        });
        logger.return('_downloadData()', {lengthOfData: finalData.length});
        return callback(error, finalData);
      } else {
        logger.warn(`Error code: ${response.statusCode}`);
        return callback(response.statusCode);
      }
    }
  );
}

module.exports = {
  downloadData: _downloadData
};
