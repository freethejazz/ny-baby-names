import React, { Component } from 'react';
import 'react-vis/dist/style.css';
import { dsv } from 'd3-fetch';
import moment from 'moment';
import { XYPlot, VerticalBarSeries, XAxis, YAxis } from 'react-vis';

import './App.css';

import dataUrl from './data/Popular_Baby_Names.csv';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
    };
    //get data
    dsv(",", dataUrl, (d) => {
      return {
        yearOfBirth: +d['Year of Birth'],
        gender: d['Gender'],
        ethnicity: d['Ethnicity'],
        firstName: d['Child\'s First Name'],
        count: +d['Count'],
        rank: +d['Rank'],
      };
    }).then((data) => this.setState({data}));
  }
  render() {
    const {
      data
    } = this.state;
    const totalBabiesByYear = Object.entries(data.reduce((acc, row) => {
      if(row.yearOfBirth in acc) {
        acc[row.yearOfBirth] = acc[row.yearOfBirth] + row.count
      } else {
        acc[row.yearOfBirth] = row.count
      }
      return acc;
    }, {})).map(([k, v]) => ({x: +k, y: v}));
    return (
      <div className="App">
        <XYPlot
          width={600}
          height={600}
          margin={{
            left: 70
          }}
          xType="ordinal"
        >
          <VerticalBarSeries
            data={totalBabiesByYear}
          />
          <XAxis />
          <YAxis />
        </XYPlot>
      </div>
    );

  }
}

export default App;
