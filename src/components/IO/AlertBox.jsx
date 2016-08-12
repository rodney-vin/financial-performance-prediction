/* eslint-env browser */

"use strict";

import React from "react";

class AlertBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: []
    };
  }

  error(msg) {
    var alerts = this.state.alerts;
    alerts.push({
      msg: msg,
      type: 'error'
    });
    this.setState({
      alerts: alerts
    });
  }

  warn(msg) {
    var alerts = this.state.alerts;
    alerts.push({
      msg: msg,
      type: 'warn'
    });
    this.setState({
      alerts: alerts
    });
  }

  clear() {
    this.setState({
      alerts: []
    });
  }

  _closeAlert(event) {
    event.target.parentNode.style.display= "none";
  }

  render() {
    var ctx = this;
    return (
      <div>
        {this.state.alerts.map(function(alert){
          if(alert.type === 'error'){
            return (
              <div className="alert alert-danger">
                <a href="#" onClick={ctx._closeAlert.bind(this)} className="close" aria-label="close">&times;</a>
                <strong>Error!</strong> {alert.msg}
              </div>
            );
          } else if(alert.type === 'warn'){
            return (
              <div className="alert alert-warning">
                <a href="#" onClick={ctx._closeAlert.bind(this)} className="close" aria-label="close">&times;</a>
                <strong>Warning!</strong> {alert.msg}
              </div>
            );
          }
        })}
      </div>
    );
  }
}

module.exports = AlertBox;
