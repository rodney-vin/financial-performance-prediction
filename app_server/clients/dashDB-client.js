'use strict';

var config = require('../../config');
var ibmdb = require('ibm_db');
var logger = require('../utils/log4js-log-util').getLogger('clients/dashDB-client');

function _isDate(str) {
  var regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(str);
}

function _insertData(conn) {
  return function (tableName, header, data, nameTranslationTable, callback) {
    var convertedData = data.map(function (dataLine) {
      var convertedDataLine = Object.keys(dataLine).map(function (key) {
        var value = dataLine[key];
        if (_isDate(value))
          return `'${value}'`;
        else
          return value;
      });

      return convertedDataLine.join(', ');
    });

    var translatedHeader = header.map(function (headerEl) {
      return nameTranslationTable[headerEl];
    });

    var query = `insert into ${tableName} (${translatedHeader.join(', ')}) values (${convertedData.join('), (')})`;
    logger.trace(`Executing SQL query: ${query}`);
    conn.query(query, function (err, queryData) {
      if (err) {
        logger.error(err);
        return callback(err);
      } else {
        return callback();
      }
    });
  };
}

function _connect(callback) {
  logger.enter('_connect()');
  var dbCredentials = config('dashDB').credentials;
  var hostname = dbCredentials.hostname;
  var username = dbCredentials.username;
  var password = dbCredentials.password;
  var port = dbCredentials.port;

  var url = `DRIVER={DB2};DATABASE=BLUDB;HOSTNAME=${hostname};UID=${username};PWD=${password};PORT=${port};PROTOCOL=TCPIP`;
  logger.debug(`connection url: ${url}`);

  ibmdb.open(
    url,
    function (err, conn) {
      if (err) {
        logger.error(err);
        return callback(err);
      } else {
        logger.return('_connect()');
        return callback(null, {
          initTable: function (tableName, callback) {
            var query = `select * from ${tableName}`;
            logger.trace(`Executing SQL query: ${query}`);
            conn.query(query, function (err, data) {
              if (err || data.length === 0) {
                var query = `create table ${tableName}(DATE DATE, VALUE DECIMAL(31,6))`;
                logger.trace(`Executing SQL query: ${query}`);
                conn.query(query, function (err, data) {
                  callback(err, data);
                });
              } else {
                var query = `delete from ${tableName}`;
                logger.trace(`Executing SQL query: ${query}`);
                conn.query(query, function (err, data) {
                  callback(err, data);
                });
              }
            });
          },
          deleteTable: function (tableName, callback) {
            var query = `drop table ${tableName}`;
            logger.trace(`Executing SQL query: ${query}`);
            conn.query(query, function (err, data) {
              callback(err, data);
            });
          },
          insertData: _insertData(conn),
          close: function (callback = function () {}) {
            conn.close(function (err) {
              logger.debug('connection with dashDB closed');
              callback(err);
            });
          }
        });
      }
    }
  );
}

module.exports = {
  connect: _connect
};
