'use strict';

const config = require('../../config');

function extractPACredentials() {
  return config('pm-20:credentials');
}

module.exports = {
  extractPACredentials: extractPACredentials
};
