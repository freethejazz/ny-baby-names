import React, { Component } from 'react';
import 'react-vis/dist/style.css';
import { dsv } from 'd3-fetch';
import moment from 'moment';
import {
  XYPlot,
  VerticalBarSeries,
  LineMarkSeries,
  DiscreteColorLegend,
  XAxis,
  YAxis,
  Hint,
} from 'react-vis';

import './App.css';

import dataUrl from './data/Popular_Baby_Names.csv';

const getPopularityByYearForName = (data, name) => {
  const nameData = data.filter(d => d.firstName === name);
  return Object.entries(nameData.reduce((acc, row) => {
    if(row.yearOfBirth in acc) {
      acc[row.yearOfBirth] = acc[row.yearOfBirth] + row.count
    } else {
      acc[row.yearOfBirth] = row.count
    }
    return acc;
  }, {})).map(([k, v]) => ({x: +k, y: v, name}));
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      hoverData: null,
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
    }).then((data) => {
      const totalBabiesByYear = Object.entries(data.reduce((acc, row) => {
        if(row.yearOfBirth in acc) {
          acc[row.yearOfBirth] = acc[row.yearOfBirth] + row.count
        } else {
          acc[row.yearOfBirth] = row.count
        }
        return acc;
      }, {})).map(([k, v]) => ({x: +k, y: v}));

      const popularNames = ["Liam", "Jacob", "Dylan", "Ethan", "David", "Aiden", "Noah", "Matthew", "Olivia", "Emma"];
      const namesWithData = popularNames.map(name => ({name, data: getPopularityByYearForName(data, name)}));

      const oliviaData = data.filter(d => d.firstName === 'Olivia');
      const oliviasByYear = Object.entries(oliviaData.reduce((acc, row) => {
        if(row.yearOfBirth in acc) {
          acc[row.yearOfBirth] = acc[row.yearOfBirth] + row.count
        } else {
          acc[row.yearOfBirth] = row.count
        }
        return acc;
      }, {})).map(([k, v]) => ({x: +k, y: v}));

      this.setState({data, totalBabiesByYear, namesWithData, oliviasByYear})
    });
  }
  render() {
    const {
      data,
      hoverData,
      namesWithData,
      totalBabiesByYear,
    } = this.state;

    if(!namesWithData) {
      return (<div className="App">
        Loading...
      </div>)
    }

    return (
      <div className="App">
        <XYPlot
          width={1200}
          height={600}
          margin={{
            left: 70
          }}
          xType="ordinal"
          onMouseLeave={() => this.setState({hoverData: null})}
        >
          {namesWithData.map(({name, data}) => (<LineMarkSeries
            onValueMouseOver={(d) => this.setState({hoverData: d})}
            key={name}
            data={data}
          />))}
          {!!hoverData && <Hint value={hoverData} />}
          <XAxis />
          <YAxis />
        </XYPlot>
        <DiscreteColorLegend width={200} items={namesWithData.map(d => d.name)} />
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
