import { createButterflyChart } from './index.js'; // import chart wrapper

createButterflyChart({
  containerSelector: '#chart', // html div id for chart
  statusSelector: '#statusMsg', // id for status text
  sortButtonSelector: '#sortBtn', // id for sort button
  labels: { left: 'Exports', right: 'Imports' }, // left and right axis labels
  dataSource: {
    type: 'csv', // data file type
    url: 'countries.csv', // name of csv file
    categoryCol: 'country', // category name column
    leftCol: 'exports', // left side values
    rightCol: 'imports', // right side values
    rightScale: 1 // scale factor for right side
  },
  chartTitle: 'Exports vs Imports by Country', // chart title text
  initialMode: 'dark' // color theme
});
