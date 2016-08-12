/* eslint-env node*/

'use strict';

const log4js = require('log4js');
const config = require('../../config');
const fs = require('fs');

let logDir = config('logDirectory');
fs.existsSync(logDir) || fs.mkdirSync(logDir);

log4js.configure({
  appenders: [
    {type: 'console'},
    {
      type: 'file',
      filename: logDir + '/' + config('fileName'),
      level: config('log4js:level'),
      maxLogSize: config('log4js:maxLogSize'),
      backups: config('log4js:backups')
    }
  ]
});

function _toString(obj) {
  if (typeof obj === 'object')
    return JSON.stringify(obj);
  else
    return obj;
}

var customLogger = {
  getLogger: function (name) {
    var logger = log4js.getLogger(name);
    logger.enter = function (where, args) {
      if (typeof args === 'undefined')
        this.debug('entering ' + where);
      else
        this.debug('entering ' + where + ', arg(s): ' + _toString(args));
    };
    logger.return = function (where, returnValue) {
      if (typeof returnValue === 'undefined')
        this.debug('returning from ' + where);
      else
        this.debug('returning from ' + where + ', return: ' + _toString(returnValue));
    };

    return logger;
  }
};

module.exports = customLogger;
