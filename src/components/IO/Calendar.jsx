/* eslint-env browser */

"use strict";

import React from "react";

class Calendar extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    var ctx = this;
    $(function () {
      $('#' + ctx.props.id).datetimepicker({
        viewMode: 'years',
        format: 'YYYY-MM',
        maxDate: new Date()
      });
    });
  }

  getValue(){
    var ctx = this;
    return $('#' + ctx.props.id).data("DateTimePicker").date().add(1, 'hours').format("YYYY-MM-DD");
  }

  isEmpty(){
    var ctx = this;
    var dataObject = $('#' + ctx.props.id).data("DateTimePicker");
    if (dataObject == null)
      return true;
    else {
      var dateObject = dataObject.date();
      if (dateObject == null)
        return true;
      else
        return false;
    }
  }

  render() {
    return (
      <div className='short-input form-group'>
          <div className='input-group date' id={this.props.id}>
            <input type='text' className="form-control" />
            <span className="input-group-addon">
              <span className="glyphicon glyphicon-calendar"></span>
            </span>
        </div>
      </div>
    );
  }
}

module.exports = Calendar;
