'use strict';

var request = require('request');
var logger = require('../utils/log4js-log-util').getLogger('clients/fred-client');
var config = require('../../config');

function _downloadData(ticker, startDate, endDate, callback) {
  logger.enter(
    '_downloadData()',
    {ticker: ticker, startDate: startDate, endDate: endDate}
  );
  var accessKey = config('fred').access_key;

  if (typeof accessKey === 'undefined')
    return callback('No access key to FRED provided');

  var url = `https://api.stlouisfed.org/fred/series/observations?series_id=${ticker}&api_key=${accessKey}&observation_start=${startDate}&observation_end=${endDate}&file_type=json&frequency=m`;

  logger.debug('Request to fred service: ' + url);

  request(
    url,
    function (error, response, body) {
      if (error) {
        logger.warn(error);
        return callback(error);
      } else if (response.statusCode >= 200 && response.statusCode < 300) {
        var jsonData = JSON.parse(body).observations;
        var finalData = jsonData.map(function (dataPiece) {
          return {
            Date: dataPiece.date,
            Value: dataPiece.value
          };
        });
        logger.return('_downloadData()', {numbarOfData: finalData.length});
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
