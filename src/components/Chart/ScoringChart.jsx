/* eslint-env browser */

"use strict";

import React from "react";
import PlotlyChart from "../Chart/PlotlyBasicChart.jsx"
var json2plotly = require('../../../app_server/utils/json2plotly-util');

class Chart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var headers = ['VALUE', '$TS-VALUE', '$TSLCI-VALUE', '$TSUCI-VALUE'];
    var data = json2plotly.scoringLineChart(this.props.data, headers,
      {
        'VALUE': 'Original series',
        '$TS-VALUE': 'Model fit and forecast',
        '$TSLCI-VALUE': 'Lower confidence interval',
        '$TSUCI-VALUE': 'Upper confidence interval'
      }
    );

    return (
      <div className="row">
        <div className="col-sm-12">
          <PlotlyChart data={data} width-to-height-ratio={3} layout={{title: 'Forecast'}} id="scoringCharts_lineChart" />
        </div>
      </div>
    );
  }
}

module.exports = Chart;
