/* eslint-env browser */

"use strict";

import React from "react";

class SummaryStatistics extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var data = this.props.data;
    var ctx = this;

    return (
      <div>
      <h4>Summary Statistics (Log Return)</h4>
      <table className="table small-text-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Mean</th>
            <th>Median</th>
            <th>Mode</th>
            <th>St. Dev</th>
            <th>Range</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map(function (dataPiece) {
              return (
                <tr>
                  <td>{dataPiece.ticker}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].mean.toFixed(4))}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].median.toFixed(4))}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].mode.toFixed(4))}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].standardDev.toFixed(4))}</td>
                  <td>{parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].min.toFixed(4))} - {parseFloat(dataPiece.summaryStatistics[ctx.props.dataPart].max.toFixed(4))}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
      </div>
    );
  }
}

module.exports = SummaryStatistics;
