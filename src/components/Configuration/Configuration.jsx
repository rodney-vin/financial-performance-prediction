/* eslint-env browser */

"use strict";

import React from "react";

class Configuration extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fredAccessKey: ""
    };
  }

  componentDidMount() {
    var ctx = this;

    $.get(
      '/config',
      function (data) {
        if(Object.keys(data).length !== 0) {
          ctx.setState({
            fredAccessKey: data.fred.access_key
          });
        }
      }
    );
  }

  _onclick() {
    $.ajax({
      type: "POST",
      url: '/config',
      headers: {"Content-type": "application/json"},
      data: JSON.stringify({
        fred: {
          access_key: this.state.fredAccessKey.trim()
        }
      }),
      success: function (err, response, data) {
        console.log('config', data);
        window.location.href = '/';
      }
    });
  }

  _onFredAccessKeyChange(event) {
    this.setState({
      fredAccessKey: event.target.value
    });
  }

  render() {
    return (
      <div className="well base-color2 special-border">
        <h1>Configuration Panel</h1>
        <div className="form-group">
          <span className="glyphicon glyphicon-info-sign inline-glyphicon" data-toggle="tooltip" title="Paste here access key to FRED service associated with your account. This key will be used when data from FRED will be imported. Providing this key is not mandatory but lack of it can result in data access errors" data-placement="right">
          </span>
          <label htmlFor="fredAccessKey">FRED service access key:</label>
          <input type="text" className="form-control shorter-input-field" id="fredAccessKey" onChange={this._onFredAccessKeyChange.bind(this)} value={this.state.fredAccessKey} />
        </div>
        <button onClick={this._onclick.bind(this)} className="btn btn-primary" type="button">Save configuration</button>
      </div>
    );
  }
}

module.exports = Configuration;
