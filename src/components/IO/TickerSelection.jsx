/* eslint-env browser */

"use strict";

import React from "react";

class TickerSelection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chosenTickers: []
    };
  }

  getValue() {
    let result = [];
    this.state.chosenTickers.forEach((tkr) => {
      let idx = result.findIndex((item) => {return item.service===tkr.service});
      if (idx == -1) {
        result.push({
          service: tkr.service,
          tickers: [tkr.name]
        });
      } else {
        result[idx].tickers.push(tkr.name);
      }
    });
    // add user tickers
    let userTickers = this.refs['userTickers'].value.trim();
    if (userTickers != '') {
      result.push({
        service: 'ut',
        tickers: userTickers.split(/\s+|,/).filter((item) => {return item != ''})
      });
    }
    return result;
  }

  _onchange(event) {
    var chosenTickers = [];
    for (var i = 0; i < event.target.selectedOptions.length; i++) {
      chosenTickers.push({
        name: event.target.selectedOptions[i].value,
        service: event.target.selectedOptions[i].parentNode.dataset.serviceid
      });
    }
    this.setState({
      chosenTickers: chosenTickers
    });
  }

  render() {
    if (this.state.chosenTickers.length > 0) {
      var chosenTickers = (
        <div>
          <b>Chosen symbols: </b>
          {this.state.chosenTickers.map((tkr) => {return tkr.name}).join(', ')}
        </div>
      )
    } else {
      var chosenTickers = null;
    }

    var data = this.props.data;

    return (
      <div>
        <div className="form-group">
          <span className="glyphicon glyphicon-info-sign inline-glyphicon" data-toggle="tooltip" title="Choose symbols for which data will be downloaded and ploted. There can be chosen up to 3 symbols at the same time. To select more than one use CTRL or SHIFT button. This example application works with monthly data only" data-placement="right">
          </span>
          <label htmlFor="tickersSelection">Select symbols: </label>
          <select multiple onChange={this._onchange.bind(this)} className="form-control" id="tickersSelection">
            {
              data.map(function (sourceData) {
                return (
                  <optgroup label={sourceData.name} data-serviceId={sourceData.id} key={sourceData.id}>
                    {
                      Object.keys(sourceData.tickers).map(function (ticker, idx) {
                        return (
                          <option key={idx} value={ticker}>{sourceData.tickers[ticker] + ' (' + ticker + ')'}</option>
                        );
                      })
                    }
                  </optgroup>
                );
              })
            }
          </select>
        </div>
        {chosenTickers}
        <br />
        <div className="form-group short-input">
          <span className="glyphicon glyphicon-info-sign inline-glyphicon" data-toggle="tooltip" title="Type here symbols which couldn't be found on above list. The data for them will be imported together with data for other symbols" data-placement="right">
          </span>
          <label htmlFor="userTickers">User symbols:</label>
          <input ref="userTickers" className="form-control"/>
        </div>
      </div>
    );
  }
}

module.exports = TickerSelection;
