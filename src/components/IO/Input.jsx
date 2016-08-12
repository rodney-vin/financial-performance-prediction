/* eslint-env browser */

"use strict";

import React from "react";
import Calendar from "./Calendar.jsx"
import AlertBox from "./AlertBox.jsx"
import TickerSelection from "./TickerSelection.jsx"

const tickers = require('json!../../../config/tickers.json');

class Input extends React.Component {
  constructor(props) {
    super(props);
  }

  _clearAlerts() {
    this.refs['tickersAlertBox'].clear();
    this.refs['startAlertBox'].clear();
    this.refs['endAlertBox'].clear();
  }

  _validate() {
    var correctData = true;
    if(this.refs['tickersSelection'].getValue().length === 0){
      correctData = false;
      this.refs['tickersAlertBox'].error('Choose at least one symbol');
    }

    var numberOfChosenTickers = 0;
    this.refs['tickersSelection'].getValue().forEach(function (partialData) {
      numberOfChosenTickers += partialData.tickers.length;
    });

    if(numberOfChosenTickers > 3){
      correctData = false;
      this.refs['tickersAlertBox'].error('Choose up to 3 symbols');
    }

    if(this.refs.start.isEmpty()){
      correctData = false;
      this.refs['startAlertBox'].error('Please define start date');
    } else if(new Date(this.refs.start.getValue()) > new Date()) {
      correctData = false;
      this.refs['startAlertBox'].error('Start date cannot be future date');
    }

    if(this.refs.end.isEmpty()){
      correctData = false;
      this.refs['endAlertBox'].error('Please define end date');
    } else if(new Date(this.refs.end.getValue()) > new Date()) {
      correctData = false;
      this.refs['endAlertBox'].error('End date cannot be future date');
    }

    if(!this.refs.start.isEmpty() && !this.refs.end.isEmpty()){
      if(new Date(this.refs.start.getValue()) >= new Date(this.refs.end.getValue())){
        correctData = false;
        this.refs['endAlertBox'].error('End date cannot be earlier than start date');
      }

      if(new Date(this.refs.end.getValue()) - new Date(this.refs.start.getValue()) < 1000*60*60*24*365*2){
        this.refs['endAlertBox'].warn('Date range is shorter than 2 years. This can cause errors in scoring model');
      }
    }

    return correctData;
  }

  _onclick(event) {
    this._clearAlerts();
    if(this._validate())
      this.props.onchange(
        this.refs['tickersSelection'].getValue(),
        this.refs.start.getValue(),
        this.refs.end.getValue()
      );
  }

  render() {
    var tickersData = [
    	{
    		name: 'Yahoo Finance',
    		id: 'yh',
    		tickers: tickers.yahoo
    	},
    	{
    		name: 'FRED Service',
    		id: 'fr',
    		tickers: tickers.fred
    	}
    ];

    return (
      <div className="well col-sm-12 base-color2 special-border">
        <div className="form-group">
          <div className="col-sm-12">
            <h3>Data Import Options</h3>
            <hr className="special-border" />
          </div>
          <div className="col-sm-7">
            <div className="form-group" key="tickers">
              <TickerSelection data={tickersData} ref="tickersSelection" />
              <AlertBox ref="tickersAlertBox" />
            </div>
          </div>
          <div className="col-sm-5">
            <div className="form-group" key="period">
              <label htmlFor="start">From:</label>
              <Calendar ref="start" id="start" />
              <AlertBox ref="startAlertBox" />
              <label htmlFor="end">to:</label>
              <Calendar ref="end" id="end" />
              <AlertBox ref="endAlertBox" />
            </div>
          </div>
        </div>
        <div className="col-sm-12">
          <button onClick={this._onclick.bind(this)} className="btn btn-primary" type="button">Go!</button>
          <AlertBox ref="totalScoringAlertBox" />
        </div>
      </div>
    );
  }
}

module.exports = Input;
