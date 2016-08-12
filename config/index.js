/* eslint-env node*/

'use strict';

const nconf = require('nconf');
const path = require('path');

nconf.argv();
nconf.add('vcapServices', {type: 'literal', store: _getVcapServicesAsJson()});
// TODO might want to load different env for test
nconf.file('dev', path.join(__dirname, 'local.json'));
nconf.file('logger', path.join(__dirname, 'logger-config.json'));
_useCustomConfig();

function _flattenArrayDataInJson(jsonObj) {
  for (let p in jsonObj) {
    if (Array.isArray(jsonObj[p])) {
      jsonObj[p] = jsonObj[p][0];
    }
  }
  return jsonObj;
}

function _getVcapServicesAsJson() {
  let vcapSvcRaw = process.env.VCAP_SERVICES;
  let vcapSvcJSON;
  // Parse VCAP Services into JSON
  if (vcapSvcRaw) {
    console.log('Parsing JSON from VCAP_SERVICES environment variable');
    try {
      vcapSvcJSON = JSON.parse(vcapSvcRaw);
      if (!vcapSvcJSON) {
        console.log('VCAP_SERVICES JSON is not defined');
        return null;
      }
      vcapSvcJSON = _flattenArrayDataInJson(vcapSvcJSON);
    } catch (error) {
      console.log('Failed to parse JSON from VCAP_SERVICES environment variable');
      console.log(error);
      return null;
    }
  }
  return vcapSvcJSON;
}

function _useCustomConfig(callback) {
  nconf.remove('customConfig');
  nconf.add('customConfig',
    {type: 'file', file: path.join(__dirname, 'configurationPanel.json')}
  );
}

module.exports = nconf.get.bind(nconf);
module.exports.refreshUserConfiguration = _useCustomConfig;
