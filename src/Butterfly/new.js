import { createButterflyChart } from './index.js'; // import chart wrapper

createButterflyChart({
  containerSelector: '#chart',            // html div id for chart
  statusSelector: '#statusMsg',           // id for status text
  sortButtonSelector: '#sortBtn',         // id for sort button
  labels: { left: 'Online sales', right: 'Store sales' }, // left and right axis labels
  dataSource: {
    type: 'csv',                          // data file type
    url: 'company_metrics.csv',           // name of csv file
    categoryCol: 'company',               // category name column
    leftCol: 'online_sales',              // left side values
    rightCol: 'store_sales',              // right side values
    rightScale: 1                         // scale factor for right side
  },
  chartTitle: 'Online sales vs Store sales by company', // chart title text
  initialMode: 'dark'                     // color theme
});