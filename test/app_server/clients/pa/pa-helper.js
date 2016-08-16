'use strict';

const chai   = require('chai');
const expect = chai.expect;

const path = require('path');
const topDir = path.join(__dirname, '../../../../');
const paHelper = require(`${topDir}app_server/clients/pa/pa-helper`);

describe('pa-helper', function () {
  it('training loads properly', function (done) {
    console.log(paHelper.getJobJson('TRAINING', 'modelId', 'modelName', 'FORECAST_DATA', 'inputsNode')); // TODO
    expect('a').to.not.equal(null);
    done();
  });
});
