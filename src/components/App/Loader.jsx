"use strict";

import React from "react";

class Loader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      info: null
    }
  }

  setInfo(info) {
    this.setState({
      info: info
    });
  }

  clearInfo() {
    this.setState({
      info: null
    });
  }

  render() {
    if(this.state.info) {
      var infoText = (
        <span>
          <center>{this.state.info}</center>
        </span>
      );
    } else {
      var infoText = null;
    }

    return (
      <div>
        <svg viewBox="25 25 50 50" className="loader loader--dark">
          <circle r="20" cy="50" cx="50" className="loader__path">
          </circle>
        </svg>
        {infoText}
      </div>
    );
  }
}

module.exports = Loader;
