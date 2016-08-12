/* eslint-env browser */

"use strict";

import React from "react";
import AlertBox from "./AlertBox.jsx"

class ScoringInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      models: []
    };
  }

  _validate() {
    var isValid = true;

    var chosenTicker = document.getElementById("scoringTickerSelection").value;
    if (this.props.options.indexOf(chosenTicker) === -1) {
      this.refs['tickersSelection'].error('No ticker chosen');
      isValid = false;
    }

    var chosenModel = document.getElementById("scoringModelSelection").value;
    var isOnModelsList = false;
    this.state.models.forEach(function (model) {
      if(model.id === chosenModel)
        isOnModelsList = true;
    });
    if(!isOnModelsList) {
      isValid = false;
      this.refs['tickersSelection'].error('No model chosen');
    }

    return isValid;
  }

  _onclick() {
    this.refs['tickersSelection'].clear();
    if(this._validate()) {
      this.props.onchange({ticker: document.getElementById("scoringTickerSelection").value, model: document.getElementById("scoringModelSelection").value});
    }
  }

  componentDidMount() {
    var ctx = this;

    $.get(
      '/modelsData',
      function (data) {
        ctx.setState({
          models: data.result
        });

        if(!data.result || data.result.length === 0) {
          ctx.props.onerror(['No valid models are loaded into Predictive Analytics service']);
          if(data.errors){
            ctx.props.onerror(data.errors, data.warnings);
          }
        } else {
          if(data.errors){
            data.errors.map(function (error) {
              ctx.refs['tickersSelection'].error(error);
            });
          }
          if(data.warnings){
            data.warnings.map(function (warning) {
              ctx.refs['tickersSelection'].warn(warning);
            });
          }
        }
      }
    );
  }

  render() {
    var options = this.props.options;

    if(this.state.models.length === 0) {
      return (
          <AlertBox ref="tickersSelection" />
      );
    } else {
      return (
        <div className="well col-sm-12 base-color2 special-border">
          <div className="col-sm-12">
            <h3>Forecast Options</h3>
            <hr className="special-border" />
          </div>
          <div className="col-sm-5">
            <span className="glyphicon glyphicon-info-sign inline-glyphicon" data-toggle="tooltip" title="Choose symbol for which will be generated forecast" data-placement="right">
            </span>
            <label htmlFor="scoringSelection">Choose symbol:</label>
            <select className="form-control short-input inline" id="scoringTickerSelection">
              <option selected disabled>Choose symbol</option>
              {options.map(function(option){
                return (
                  <option>{option}</option>
                );
              })}
            </select>
          </div>
          <div className="col-sm-5">
            <span className="glyphicon glyphicon-info-sign inline-glyphicon" data-toggle="tooltip" title="Choose one of the models uploaded to your PA service instance. The forecast will be generated using your chosen model" data-placement="right">
            </span>
            <label htmlFor="scoringSelection">Choose model:</label>
            <select className="form-control short-input inline" id="scoringModelSelection">
              <option selected disabled>Choose model</option>
              {this.state.models.map(function(model){
                return (
                  <option>{model.id}</option>
                );
              })}
            </select>
          </div>
          <div className="col-sm-2">
            <button onClick={this._onclick.bind(this)} className="btn btn-primary" type="button">Forecast</button>
          </div>
          <div className="col-sm-12">
            <AlertBox ref="tickersSelection" />
          </div>
        </div>
      );
    }
  }
}

module.exports = ScoringInput;
