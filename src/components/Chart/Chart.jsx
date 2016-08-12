/* eslint-env browser */

"use strict";

import React from "react";
import PlotlyChart from "../Chart/PlotlyBasicChart.jsx"
var json2plotly = require('../../../app_server/utils/json2plotly-util');
import SummaryStatistics from "../IO/SummaryStatistics.jsx"
import MathMLMatrix from "../IO/MathMLMatrix.jsx"

class Chart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if(this.props.data.length > 1) {
      var scatterplotMatrixData = json2plotly.scatterplotMatrix(this.props.data, 'logReturn');
      scatterplotMatrixData.layout.title = 'Scatterplot Matrix (Log Return)';
      var scatterplotMatrix = (
        <PlotlyChart data={scatterplotMatrixData.data} width-to-height-ratio={1} layout={scatterplotMatrixData.layout} id="charts_scatterplotMatrixChart" />
      );
    } else {
      var scatterplotMatrix = null;
    }

    var data = json2plotly.basicChart(this.props.data, 'data', 'scatter');
    var logReturn = json2plotly.histogram(this.props.data, 'logReturn');
    return (
      <div className="row">
        <div className="col-sm-6">
          <PlotlyChart data={data} width-to-height-ratio={1.5} layout={{title: 'Time series'}} id="charts_lineChart" />
          {scatterplotMatrix}
        </div>
        <div className="col-sm-6">
          <PlotlyChart data={logReturn} width-to-height-ratio={1.5} layout={{title: 'Log Return', barmode: 'overlay'}} id="charts_logReturnChart" />
          <SummaryStatistics data={this.props.data} dataPart="logReturn" />
        </div>
      </div>
    );
  }
}

module.exports = Chart;
