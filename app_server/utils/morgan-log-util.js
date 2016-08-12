/* eslint-env node*/

'use strict';

var fs = require('fs');
var morgan = require('morgan');
const config = require('../../config');

module.exports = function (app) {
  var logDirectory = config('logDirectory');
  var fileName = config('fileName');
  var logType = config('morgan:loggingType');

  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

  var accessLogStream = fs.createWriteStream(
    logDirectory + '/' + fileName,
    {flags: 'a'}
  );

  var morganFileLogger = morgan(logType, {stream: accessLogStream});
  var morganConsoleLogger = morgan(logType);

  app.use(morganFileLogger);
  app.use(morganConsoleLogger);
};
