/* eslint-env browser */

"use strict";

import React from "react";

class Table extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var ctx = this;

    return (
      <table className="table">
        <thead>
          <tr>
            {this.props.header.map(function(headerEl){
              return (<th>{headerEl}</th>);
            })}
          </tr>
        </thead>
        <tbody>
          {this.props.data.map(function(line){
            return (
              <tr>
                {ctx.props.header.map(function(headerEl){
                  return (
                    <td>{line[headerEl]}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}

module.exports = Table;
