/* eslint-env browser */

"use strict";

import React from "react";
var util = require('util');
import Input from "../IO/Input.jsx"
import Chart from "../Chart/Chart.jsx"
import ScoringChart from "../Chart/ScoringChart.jsx"
import ScoringInput from "../IO/ScoringInput.jsx"
import Table from "../IO/Table.jsx"
import Loader from "./Loader.jsx"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  _setData(tickers, start, end) {
    this.setState({
      loading: true
    });
    var ctx = this;
    let tkrsQueryPart = tickers.map((tkr) => {return `${tkr.service}=${tkr.tickers.join(',')}`});
    let url = util.format('/stockData?%s&start=%s&end=%s',
      tkrsQueryPart.join('&'),
      start,
      end);
    $.ajax({
      url: url,
      type: 'GET',
      success: function(data) {
        data.errors.forEach(function(error){
          ctx.refs['input'].refs['tickersAlertBox'].error(error);
        });
        data.warnings.forEach(function(warning){
          ctx.refs['input'].refs['tickersAlertBox'].warn(warning);
        });
        ctx.setState({
          data: data.result,
          scoringData: null,
          loading: false
        });
      }
    });
  }

  _setScoringData(runData) {
    this.setState({
      loading: true
    });

    var counter = 10;
    var ctx = this;
    var socket;
    var intervalId = setInterval(function () {
      --counter;
      if(counter == 0) {
        clearInterval(intervalId);
        console.log('Cannot establish connection with socket io server');
      }
      socket = io('http://localhost:4000');
      socket.on('info', function (data) {
        ctx.refs["loader"].setInfo(data);
      });
      socket.on('connected', function (data) {
        clearInterval(intervalId);
        console.log('Successfully connected to socket io server');
      });
    }, 1000);

    var ctx = this;
    this.state.data.forEach(function (tickerData) {
      if(tickerData.ticker === runData.ticker) {
        $.ajax({
          type: "POST",
          url: "/score",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify({
            data: tickerData,
            model: runData.model
          }),
          success: function (data) {
            if(socket)
              socket.disconnect();

            ctx.setState({
              loading: false
            });

            if (data.errors) {
              data.errors.forEach(function(error){
                ctx.refs['scoringInput'].refs['tickersSelection'].error(error);
              });
            }
            ctx.setState({
              scoringData: data.result
            });
          },
          failure: function (data) {
            if(socket)
              socket.disconnect();
            console.log('score failure', data);
          }
        });
      }
    });
  }

  _onScoringError(errors, warnings) {
    var ctx = this;
    if (errors) {
      errors.map(function (error) {
        ctx.refs['input'].refs['totalScoringAlertBox'].error(error);
      });
    }
    if (warnings) {
      warnings.map(function (warning) {
        ctx.refs['input'].refs['totalScoringAlertBox'].warn(warning);
      });
    }
  }

  render() {
    if(this.state.loading) {
      var loading = (
      <div className="loadingOverlayContainer">
        <div className="loadingContainer">
          <Loader ref="loader" />
        </div>
      </div>
      );
    } else {
      var loading = null;
    }

    if(!this.state.scoringData || this.state.scoringData.length === 0)
      var scoringOutput = null;
    else
      var scoringOutput = (
        <ScoringChart data={this.state.scoringData} />
      );

    if (!this.state.data || this.state.data.length === 0) {
      var renderedCharts = null;
    } else {
      var options = this.state.data.map(function (tickerData) {
        return tickerData.ticker;
      });
      var renderedCharts = (
        <div>
          <Chart data={this.state.data} />
          <ScoringInput ref="scoringInput" onerror={this._onScoringError.bind(this)} onchange={this._setScoringData.bind(this)} data={this.state.data} options={options} />
          {scoringOutput}
        </div>
      );
    }

    return (
      <div>
        {loading}
        <Input ref="input" onchange={this._setData.bind(this)} />
        {renderedCharts}
      </div>
    );
  }
}

module.exports = App;
