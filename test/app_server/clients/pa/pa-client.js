'use strict';

const path = require('path');
const topDir = path.join(__dirname, '../../../../');
const PAService = require(`${topDir}app_server/clients/pa/pa-client`);
const chai   = require('chai');
const expect = chai.expect;
const helper = require(`${topDir}test/test-utils/helper`);

let testPAService;
let testOf = '/app_server/clients/pa/pa-client';

before(function () {
  testPAService = new PAService(helper.extractPACredentials());
});

let id = `${testOf} get`;
describe(`${id}`, function () {
  it(`${id} valid request`, function (done) {
    testPAService.get('model', {}, function (err, res) {
      expect(err).to.equal(null);
      done();
    });
  });

  it(`${id} valid request, no params`, (done) => {
    testPAService.get('model', function (err, res) {
      expect(err).to.equal(null);
      done();
    });
  });

  it(`${id} error if no callback given`, () => {
    expect(testPAService.get.bind('model', {})).to.throw('Callback must be a function');
  });

  it(`${id} error if request is invalid`, (done) => {
    testPAService.get('nonexistent', function (err, res) {
      expect(err).to.exist;
      done();
    });
  });
});

id = `${testOf} model api`;
describe(`${id}`, () => {
  let id = 'autotest';

  before(function (done) {
    this.timeout(5000);
    testPAService.uploadModel(id, path.join(`${topDir}`,
        '/test/test-utils/test_stream.str'), function (err, res) {
          expect(err).to.equal(null);
          done();
        });
  });

  it(`${id} getModel`, (done) => {
    testPAService.getModel(id, function (err, res) {
      expect(err).to.equal(null);
      done();
    });
  });

  it(`${id} getModels`, function (done) {
    this.timeout(5000);
    testPAService.getModels(function (errors, res) {
      expect(errors.length).to.equal(0);
      done();
    });
  });

  it(`${id} getScore`, (done) => {
    let scoreParam = {
      'tablename': 'inputmetadata.csv',
      'header': ["Date", "Open", "High", "Low", "Close", "Volume", "Adj Close"],
      'data': [["2016-05-05", "113.040001", "113.339996", "112.690002", "113.059998", "4457300", "113.059998"]]
    }
    testPAService.getScore(id, scoreParam, function (err, res) {
      expect(err).to.equal(null);
      done();
    });
  });

  after((done) => {
    testPAService.deleteModel(id, function (err, res) {
      expect(err).to.equal(null);
      done();
    });
  });
});

id = `${testOf} job api`;
describe(`${id}`, () => {
  let jobId = 'testJob';
  let modelId = 'testModel';

  before((done) => {
    testPAService.uploadFile(modelId, path.join(`${topDir}`,
        '/test/test-utils/testStream.str'), function (err, res) {
          expect(err).to.equal(null);
          done();
        });
  });

  it(`${id} result`, (done) => {
    testPAService.createJob('TRAINING', jobId, modelId, 'modelName', 'inputmetadata.csv', function (err, res) {
      expect(err).to.equal(null);
      done();
    });
  });

  after((done) => {
    testPAService.deleteJob(jobId, function (err, res) {
      expect(err).to.equal(null);
      testPAService.deleteFile(modelId, function (err, res) {
        done();
      });
    });
  });
});
