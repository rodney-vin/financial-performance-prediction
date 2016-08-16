'use strict';

var logger = require('../../utils/log4js-log-util').getLogger('clients/pa/forecast-api');
var PAClient = require('./pa-client');
var config = require('../../../config');
var request = require('request');
var pa2json = require('../../utils/pa2json-util');
var dashDBClient = require('../dashDB-client');
var fs = require('fs');
var uuid = require('node-uuid');

let paClient = new PAClient(_getPMEnvironment());

function _constructDataDownloadUrl(url) {
  var credentials = _getPMEnvironment();
  return `${url}?accesskey=${credentials.access_key}`;
}

function _waitForBatchJobToFinish(jobId, callback) {
  logger.enter('_waitForBatchJobToFinish()', jobId);
  var intervalId = setInterval(function () {
    paClient.getJobStatus(jobId, function (error, status) {
      switch (status.jobStatus) {
      case 'SUCCESS':
        clearInterval(intervalId);
        logger.return('_waitForBatchJobToFinish()');
        return callback(null, status);
      case 'RUNNING':
        logger.trace('processing heartbeat <3');
        break;
      case 'PENDING':
        logger.trace('pending...');
        break;
      case 'FAILED':
        clearInterval(intervalId);
        logger.error(status.failureMsg);
        return callback(status.failureMsg);
      default:
        clearInterval(intervalId);
        logger.error(`Unsupported job status: ${status.jobStatus} for job id: ${status.jobId}, full status: ${status}`);
        return callback(status);
      }
    });
  }, 2000);
}

function _doJob(action, jobId, fileId, fileName, tableName, inputsTable, callback) {
  logger.enter('_doJob()', {jobId: jobId, fileId: fileId, fileName: fileName, tableName: tableName, inputsTable: inputsTable});
  paClient.createJob(action, jobId, fileId, fileName, tableName, inputsTable, function (error, data) {
    if (error !== null) {
      logger.error(error);
      return callback(error);
    } else {
      _waitForBatchJobToFinish(jobId, function (error, status) {
        if (error !== null) {
          logger.error(error);
          return callback(error);
        } else {
          logger.return('_doJob()');
          return callback(null, status);
        }
      });
    }
  });
}

function _prepareDatabase(tableName, data, callback) {
  logger.enter('_prepareDatabase()', {tableName: tableName});
  dashDBClient.connect(function (error, dbConnector) {
    if (error) {
      logger.error(error);
      return callback(error.message);
    } else {
      dbConnector.initTable(tableName, function (error) {
        if (error) {
          logger.error(error);
          return callback(error.message);
        } else {
          var header = Object.keys(data.data[0]);
          var nameTranslationTable = {};
          header.forEach(function (headerEl) {
            nameTranslationTable[headerEl] = headerEl.toUpperCase().replace(' ', '_');
          });
          dbConnector.insertData(tableName, header, data.data, nameTranslationTable, function (error) {
            if (error) {
              logger.error(error);
              return callback(error.message);
            } else {
              dbConnector.close();
              logger.return('_prepareDatabase()');
              return callback();
            }
          });
        }
      });
    }
  });
}

function _reloadTrainedModel(url, fileId, filePath, callback) {
  logger.enter('_reloadTrainedModel()', {url: url, fileId: fileId, filePath: filePath});
  request(
    {
      method: 'GET',
      url: _constructDataDownloadUrl(url),
      encoding: null
    },
    function (error, response, body) {
      if (error !== null) {
        logger.error(error);
        return callback(error);
      } else {
        fs.writeFile(`${filePath}`, body, function (err) {
          if (err) {
            return logger.error(err);
          }

          paClient.uploadFile(fileId, filePath, function (error, jobUploadData) {
            if (error !== null) {
              logger.error(error);
              return callback(error);
            } else {
              logger.return('_reloadTrainedModel()');
              return callback();
            }
          });
        });
      }
    }
  );
}

function _prepareEnv(modelId, fileId, filePath, tableName, data, callback) {
  logger.enter('_prepareEnv', {modelId: modelId, fileId: fileId, filePath: filePath, tableName: tableName});

  var basicPath = filePath.split('/');
  basicPath.splice(basicPath.length - 1, 1);
  basicPath = basicPath.join('/');
  if (!fs.existsSync(basicPath)) {
    fs.mkdirSync(basicPath);
  }

  paClient.downloadModel(modelId, filePath, function (error) {
    if (error) {
      logger.error(error);
      return callback(error);
    } else {
      paClient.uploadFile(fileId, filePath, function (error, jobUploadData) {
        if (error !== null) {
          logger.error(error);
          return callback(error);
        } else {
          _prepareDatabase(tableName, data, function (error) {
            if (error) {
              logger.error(error);
              return callback(error);
            } else {
              logger.return('_prepareEnv');
              return callback();
            }
          });
        }
      });
    }
  });
}

function _clean(basicModelFileId, trainedModelFileId, trainingJobId, scoringJobId, trainedModelDownloadId, scoringDataDownloadId, tableName) {
  var maxCounter = 10;
  logger.enter('_clean()');
  var counter = 7;
  paClient.deleteFile(basicModelFileId, function (error) {
    if (error) {
      logger.error(error);
    }
    counter--;
  });
  paClient.deleteFile(trainedModelFileId, function (error) {
    if (error) {
      logger.error(error);
    }
    counter--;
  });
  paClient.deleteFile(trainedModelDownloadId, function (error) {
    if (error) {
      logger.error(error);
    }
    counter--;
  });
  paClient.deleteFile(scoringDataDownloadId, function (error) {
    if (error) {
      logger.error(error);
    }
    counter--;
  });
  paClient.deleteJob(trainingJobId, function (error) {
    if (error) {
      logger.error(error);
    }
    counter--;
  });
  paClient.deleteJob(scoringJobId, function (error) {
    if (error) {
      logger.error(error);
    }
    counter--;
  });
  dashDBClient.connect(function (error, dbConnector) {
    if (error)
      return error;
    dbConnector.deleteTable(tableName, function (err) {
      if (err) {
        logger.error(err);
      }
      dbConnector.close();
      counter--;
    });
  });
  var intervalId = setInterval(function () {
    --maxCounter;
    logger.trace('cleaning heartbeat <3 ');
    if (maxCounter === 0) {
      clearInterval(intervalId);
      logger.error(`cleaning not finished successfully, cleaning counter: ${counter}`);
    }
    if (counter === 0) {
      clearInterval(intervalId);
      logger.return('_clean()');
    }
  }, 1000);
}

function _run(data, modelId, sendMessage, callback) {
  logger.enter('_run()');

  var uniqueId = uuid.v4();

  var basicModelFileId = 'basicModelFileId_' + uniqueId;
  var basicModelFilePath = 'app_server/models/downloaded.str';

  var trainedModelFileId = 'trainedModelFileId_' + uniqueId;
  var trainedModelFilePath = 'app_server/models/trained.str';

  var trainingJobId = 'training_job_id_' + uniqueId;
  var scoringJobId = 'scoring_job_id_ ' + uniqueId;
  var tableName = 'FORECAST_DATA_' + uniqueId.toUpperCase().split('-').join('_');

  var trainedModelDownloadId = '';
  var scoringDataDownloadId = '';

  sendMessage('Preparing environment');

  _prepareEnv(modelId, basicModelFileId, basicModelFilePath, tableName, data, function (error, jobUploadData) {
    if (error) {
      logger.error(error);
      return callback([error]);
    } else {
      sendMessage('Training model');
      _doJob('TRAINING', trainingJobId, basicModelFileId, 'tsfinalout.str', tableName, 'in', function (error, status) {
        if (error) {
          logger.error(error);
          return callback([error]);
        } else {
          sendMessage('Reloading model');
          trainedModelDownloadId = status.dataUrl.substring(status.dataUrl.lastIndexOf('/'), status.dataUrl.length);
          _reloadTrainedModel(status.dataUrl, trainedModelFileId, trainedModelFilePath, function (error) {
            if (error) {
              logger.error(error);
              return callback([error]);
            } else {
              sendMessage('Forecasting');
              _doJob('BATCH_SCORE', scoringJobId, trainedModelFileId, 'tsfinalout.str', tableName, tableName, function (error, status) {
                if (error) {
                  logger.error(error);
                  return callback([error]);
                } else {
                  sendMessage('Downloading result');
                  scoringDataDownloadId = status.dataUrl.substring(status.dataUrl.lastIndexOf('/'), status.dataUrl.length);
                  request.get(
                    _constructDataDownloadUrl(status.dataUrl),
                    function (error, response, body) {
                      if (error) {
                        logger.error(error);
                        return callback([error]);
                      } else {
                        _clean(
                          basicModelFileId, trainedModelFileId,
                          trainingJobId, scoringJobId,
                          trainedModelDownloadId, scoringDataDownloadId,
                          tableName);
                        logger.return('_run()');
                        return callback(null, {ticker: data.ticker, source: data.source, data: pa2json.translate(body)});
                      }
                    }
                  );
                }
              });
            }
          });
        }
      });
    }
  });
}

function _getPMEnvironment() {
  return config('pm-20').credentials;
}

module.exports = {
  run: _run
};
