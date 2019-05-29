import React, { Component } from 'react';
import 'react-vis/dist/style.css';
import { dsv } from 'd3-fetch';
import {
  FlexibleWidthXYPlot,
  VerticalBarSeries,
  LineMarkSeries,
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
      ethnicityFilter: null,
      ethnicities: [],
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
      const chartData = this.calculateChartData(data);
      const ethnicities = this.getEthnicities(data);

      this.setState({...chartData, data, ethnicities })
    });
  }
  getEthnicities(data) {
    return Object.keys(data.reduce((acc, d) => {
      acc[d.ethnicity] = true;
      return acc;
    }, {}))
  }
  getTotalBabiesByYear(data) {
    return Object.entries(data.reduce((acc, row) => {
      if(row.yearOfBirth in acc) {
        acc[row.yearOfBirth] = acc[row.yearOfBirth] + row.count
      } else {
        acc[row.yearOfBirth] = row.count
      }
      return acc;
    }, {})).map(([k, v]) => ({x: +k, y: v}));
  }
  getTopBabyNames(data, limit) {
    const namesWithCounts = Object.entries(data.reduce((acc, row) => {
      if(row.firstName in acc) {
        acc[row.firstName] = acc[row.firstName] + row.count
      } else {
        acc[row.firstName] = row.count
      }
      return acc;
    }, {}));
    namesWithCounts.sort((a, b) => {
      if(a[1] < b[1]) {
        return 1;
      }
      if(a[1] > b[1]) {
        return -1;
      }
      return 0;
    });
    return namesWithCounts.slice(0, limit).map(([k, v]) => k);
  }
  getYearlyDataForNames(data, names) {
      return names.map(name => ({name, data: getPopularityByYearForName(data, name)}));
  }
  calculateChartData(data, ethnicityFilter) {
    const totalBabiesByYear = this.getTotalBabiesByYear(data);
    const top10BabyNames = this.getTopBabyNames(data, 10);
    const namesWithData = this.getYearlyDataForNames(data, top10BabyNames);
    return {
      ethnicityFilter,
      totalBabiesByYear,
      namesWithData,
    };
  }
  filterData(filter) {
    const chartData = this.calculateChartData(this.state.data.filter((d) => d.ethnicity === filter));
    this.setState({...chartData, ethnicityFilter: filter});
  }
  render() {
    const {
      hoverData,
      namesWithData,
      totalBabiesByYear,
      ethnicities,
      ethnicityFilter,
    } = this.state;

    if(!namesWithData) {
      return (<div className="App">
        Loading...
      </div>)
    }

    return (
      <div className="App">
        <div className="row">
          <div className="chart double">
            <FlexibleWidthXYPlot
              animate
              height={300}
              margin={{
                left: 70,
              }}
              xType="ordinal"
              onMouseLeave={() => this.setState({hoverData: null})}
            >
              {namesWithData.map(({name, data}) => (<LineMarkSeries
                animation
                onValueMouseOver={(d) => this.setState({hoverData: d})}
                key={name}
                data={data}
              />))}
              {!!hoverData && <Hint value={hoverData} />}
              <XAxis />
              <YAxis />
            </FlexibleWidthXYPlot>
          </div>
          <div className="chart">
            <FlexibleWidthXYPlot
              height={300}
              margin={{
                left: 70
              }}
              xType="ordinal"
            >
              <VerticalBarSeries
                animation
                data={totalBabiesByYear}
              />
              <XAxis />
              <YAxis />
            </FlexibleWidthXYPlot>
          </div>
        </div>
        <div className="row">
          <ul className="ethnicities">
            {ethnicities.map((e) => {
              return (
                <li
                  className={e === ethnicityFilter ? 'selected' : ''}
                  onClick={() => this.filterData(e)}
                >
                  {e}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );

  }
}

export default App;
