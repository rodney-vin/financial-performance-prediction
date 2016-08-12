/* eslint-env browser */

"use strict";

import React from "react";

class Overview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="well base-color2">
        <h3>Time Series Application Overview</h3>
        <p>Time Series sample application gives you ability to work with financial and economic time series data to gain powerful insights into the future.</p>
        <p>Application delivers analytics-driven environment where you can explore time series from various perspectives and forecast future by using most suitable forecasting methods.</p>
        <p>Application deployed on Predictive Analytics Service consists of two parts.</p>
        <ol>
          <li>First part is about downloading financial and economical time series from open data sources and exploring them to see general characteristics such as trend, seasonality, return distributions and correlation between time series.</li>
          <li>Second part helps us to forecast near-future based on historical data with a level of confidence so that we can use time series analysis and forecast to solve our specific business problem.</li>
        </ol>
        <p>In practice, time series modeling is ambitious undertaking and it is used in many different fields to produce forecasts for different types of time series data, especially used today for many economic variables such as weekly sales figures, monthly returns of a stocks, inflation or gross domestic product.</p>
        <p>Time series sample application is using IBM Predictive Analytics and IBM SPSS Modeler together to provide functionalities mentioned above.</p>
        <p>Time Series Modeling node in IBM SPSS Modeler provides us methods such as exponential smoothing, univariate Autoregressive Integrated Moving Average (ARIMA), and multivariate ARIMA (or transfer function) models for time series.</p>
        <p>One of the greatest features of Time Series Modeling node is Expert Modeler. Expert Modeler, which automatically identifies and estimates the best-fitting ARIMA or exponential smoothing model for one or more target variables, thus eliminating the need to identify an appropriate model through trial and error.</p>
        <p>IBM Predictive Analytics takes things even further and allows us to deploy streams that we develop in IBM SPSS Modeler to cloud environment to turn our data models into fully fledged business applications.</p>
        <p>In the context of this application, IBM Predictive Analytics Service provides useful framework to gather, explore and forecast financial and economical time series in iterative nature without requiring repetitive manual steps and automating the whole end-to-end process.</p>
        <p>One can see how powerful it can be to use IBM SPSS Modeler and IBM Predictive Analytics Service together to work with financial and economical time series and how IBM Predictive Analytics puts all these capabilities into the hands of its users.</p>
      </div>
    );
  }
}

module.exports = Overview;
