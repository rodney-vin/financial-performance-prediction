# financialTS-application

## Run the app locally

1. [Install Node.js, the minimal version is 6.3.1][]
2. Run `npm install` to install the app's dependencies
3. Run `npm start` to start the app
4. Access the running app in a browser:
a) Express server available at http://localhost:4000
b) Hot reloading available in development mode only at http://localhost:4010 . Express remains available at port 4000.

## Link local application with the bluemix environment

0. In project directory create ./config/local.json from ./config/local.json.template.
1. Bind 'dashDB' and 'Predictive Analytics' services to your (or any) bluemix application.
2. Perform 'Show credentials' of binded services and copy each of them.
3. Paste copied credentials to ./config/local.json following its format.

## Local testing
1. Test environment uses credentials from ./config/local.json
2. TODO - nock mocking

## Mock database (not yet used)

```json-server db/scoring.json```
