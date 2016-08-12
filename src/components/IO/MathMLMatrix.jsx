/* eslint-env browser */

"use strict";

import React from "react";
var numbers = require('numbers');

class Input extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var matrix = [];
    var data = this.props.data;

    for(var i = 0; i < data.length; ++ i) {
      matrix.push([]);
      for(var j = 0; j < data.length; ++j) {
        if(i === j) {
          matrix[i][j] = 1;
        } else if(j < i) {
          matrix[i][j] = matrix[j][i]
        } else {
          var x = data[i][this.props.dataPart].map(function (el) {
            return parseFloat(el.Value);
          });

          var y = data[j][this.props.dataPart].map(function (el) {
            return parseFloat(el.Value);
          });

          var minLen = Math.min(x.length, y.length);

          x = x.slice(0, minLen);
          y = y.slice(0, minLen);

          matrix[i].push(numbers.statistic.correlation(x, y));
        }
      }
    }

    return (
      <div style={{"paddingTop": "30px", "paddingBottom": "30px"}}>
      <math display="inline">
        <mi>{this.props.title}</mi>
        <mo>=</mo>
        <mrow>
          <mo>[</mo>
            <mtable>
              {matrix.map(function (row) {
                return (
                  <mtr>
                    {row.map(function (el) {
                      return (
                        <mtd>
                          <mn>
                            {parseFloat(el.toFixed(2))}
                          </mn>
                        </mtd>
                      );
                    })}
                  </mtr>
                );
              })}
            </mtable>
          <mo>]</mo>
        </mrow>
      </math>
      </div>
    );
  }
}

module.exports = Input;
