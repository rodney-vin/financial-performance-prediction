'use strict';

const chai   = require('chai');
const expect = chai.expect;

const config = require('../../config');

describe('config general test', function () {
  it('config inits properly', function (done) {
    let someValue = config('myVal');
    expect(someValue).to.not.equal(null);
    done();
  });
});
