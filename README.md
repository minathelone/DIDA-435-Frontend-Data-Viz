# 🎨📈 funky-graphs
A JavaScript library for creating advanced, interactive 3D data visualizations in the browser. Built with various JavaScript libraries for stunning visual effects.

## Installation and Setting Up Your Environment
Install via npm (write this in the terminal):
npm install funky-graphs
Set up an HTML file and create a div to host your graph:
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Data Visualization</title>
    <style>
        #plotContainer {
            width: 800px;
            height: 600px;
            border: 1px solid #eee;
            margin: 20px auto;
        }
    </style>
</head>
<body>
    <h1>Revenue Over Time</h1>
    <div id="plotContainer"></div>
    <script type="module" src="./app.js"></script>
</body>
</html>
```
Create a javascript file and import the graph(s) of your choice:
```javascript
import { createWaterfallPlot } from 'funky-graphs';
Call the function and pass the relevant data and parameters in!
createWaterfallPlot('./data.csv', 'chart-container', 'light', 'Time', 'Revenue');
```

## Example Usage
### **Radial Histogram**  
Check out the [documentation](Documentation/RadialHistogram.md)
```javascript
createRadicalHistogram('/src/data.json',
    "radial-histogram",
    'dark',
    600,
    600,
    150,
    "genre"
    );
```
<img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/60f8a297-d534-4cca-8f78-72763e76e183" />

### **Butterfly Chart**  
Check out the [documentation](Documentation/ButterflyChart.md)
```javascript
import { createButterflyChart } from 'funky-graphs';

createButterflyChart({
  containerSelector: '#chart',            // html div id for chart
  statusSelector: '#statusMsg',           // id for status text
  sortButtonSelector: '#sortBtn',         // id for sort button
  labels: { left: 'Exports', right: 'Imports' }, // left and right axis labels
  dataSource: {
    type: 'csv',                          // data file type
    url: 'countries.csv',                 // name of csv file
    categoryCol: 'country',               // category name column
    leftCol: 'exports',                   // left side values
    rightCol: 'imports',                  // right side values
    rightScale: 1                         // scale factor for right side
  },
  chartTitle: 'Exports vs Imports by Country', // chart title text
  initialMode: 'dark'                     // color theme
});
```
<img width="1170" height="695" alt="butterfly-main" src="https://github.com/user-attachments/assets/644fc540-c8ab-488d-8e03-46ec2c0887cc" />

### **Pictorial Graph**  
Check out the [documentation](Documentation/PictorialGraph.md)
```javascript
import { createPictorialGraph } from './index.js';

const shapes = {
  person: {
    name: 'Human',
    value: 5.7,
    color: '#8a8affff',
    paths: { definition: 'M28.64-6.248c-.352-3.984-3.56-7.656-7.632-8.032-2.2-.2-4.488-.232-6.816-.192C21.752-18.64 19.408-33.128 8.416-31.928c-9.776 1.064-10.448 13.608-3.52 17.464-2.392-.04-4.76-.016-7.016.192-4.072.376-7.28 4.048-7.632 8.032-.768 8.592.568 18.272 0 26.984.664 4.304 6.472 4.432 7.344.168l.016-23.008.312-.448 1.2-.024v64.064c0 .128.336 1.248.416 1.464.608 1.568 2.008 2.456 3.544 2.968h1.696c1.6-.56 2.904-1.304 3.56-2.944.088-.224.4-1.16.4-1.296v-37.928c.16-.2.432-.304.712-.32.28.008.544.112.712.32v37.928c0 .144.312 1.072.4 1.296.656 1.64 1.968 2.384 3.56 2.944h1.696c1.536-.512 2.936-1.4 3.544-2.968.088-.216.416-1.344.416-1.464V-2.576l1.2.024.312.448.016 23.008c.872 4.264 6.68 4.128 7.344-.168-.568-8.704.76-18.392 0-26.984Z', max: 5.7 }
  },

  animal1: {
    name: 'Cat (Animal)',
    value: 1.0,
    color: '#8bff8bff',
    paths: { definition: 'M41.4 51.8c0 0 0 .6-.3.8-1.3 1.7-4.9 1.4-6.8 1s-1.3-.6-1.7-.6-1 .5-1.5.6c-2.3.4-6.1.7-7.2-1.9-4 .5-8.2.4-12.1-.8-13.5-4.1-11.9-18.7-8.5-29.5s5.5-12.1 4.2-17-4.5-3.8-2.7-7.1 6.6-.3 8 2.2c7.4 13-11.5 30.2-1 42.4s3 3 4.2 2c-2.5-5.5-5.7-13.3-2.6-19.1s2.9-3.1 4-4.9c.3-8.9 1.5-17.3 3.2-26s2.5-8.6 2-11.2-2.1-3.8-2.7-5.7c-.9-2.7 0-5.1 0-7.9s-.6-3.6-.7-5.3-.2-6.9 1.1-7.3c2.4-.8 5.3 3.9 6.8 5.1s2.1.7 4.2.6 3.7.4 5 .4 3.8-3.5 5.3-4.7 2.7-2 3.6-1.2c2 1.7.2 10.3.1 12.8s.6 3.7.5 5.5c-.3 2.7-2.5 5.6-3 8.3s1.2 7.2 1.7 10c1.3 6.5 2.4 13 2.9 19.6s0 4.9.3 6.7 2.4 2.7 3.2 3.7c4.4 5.8 1.1 14.3-1.6 20.2s-1.9 3.1-2.2 4', max: 1.0 }
  },

  animal2: {
    name: 'Dog (Animal)',
    value: 1.3,
    color: '#8bff8bff',
    paths: { definition: 'M64 35.9c-2.2-3.2-6.4-3.8-10-3.1.5-.2 1.7-.8 2.5-2.1.6-1 .8-1.9.8-2.4 1.5 1.2 3.8 2.7 7 3.7 4.2 1.3 8.3 1.2 8.4.8 0-.3-2-.5-5.3-2-4.8-2.2-5.8-4.1-6.2-4.8-.5-1-.6-2-.7-2.3-.2-1.3 0-1.8.2-4.6.2-2.1.1-2.9 0-3.1 0-.3-.1-1.5-.4-2.7-.7-2.9-2.8-6-5.9-7.8-.9-.5-1.6-.8-2.1-.9 4-13.3 2.3-21.5-.3-26.5-2.9-5.8-7.3-11.4-5.4-17 .5-1.6 2.2-5.2 1.3-9.4-.2-.8-.6-2.2-.6-2.2-.1 0 1.7 9.9 3.9 9.9.3 0 .6-.2.7-.3 2.7-2.5 5.3-6.7 6-7.7 2.9-4.5 5.1-4.3 5.1-6.6 0-1.4-.9-2-4.6-5.8-6.4-6.5-6.9-7.8-9.3-8.3-2.2-.4-2.9 0-5.8-.4-1.3-.2-3.2-1.3-4.6-1.7-3-.8-5.8-.9-8.9-.2-2.4.5-4.8 1.8-7.2 2-4.4.3-4.9 0-8.4 3-2.6 2.1-6.1 5.1-8.4 7.5-3.5 3.8 1.4 9.6 4.2 12.2 1.5 1.4 3.4 2.5 4.5 4.4.6.9.7 2.4 2.2 2 0 0 .5-.1.9-.6.6-.7 2.4-8.1 2.1-8.2-.2 0-1.1 2.8-.7 5.5.5 2.7 2.1 3.8 2.8 5.3 2.4 4.7-3.9 11.4-6.7 17.2-2.5 5-4.1 13-.1 25.7-1 .4-2.7 1.4-3.1 1.7-5 3.6-6 9.6-4.6 15.3 1.1 4.4 3.7 8.1 6.6 11.5-4-1.4-10.8.6-11.2 5.5 0 .3 0 1.2.4 1.9.5.7 1.4 1.3 5.6 1.5 1.4 0 3.4.1 5.9 0 .1 1.1.6 2 1.3 2.3.4.2.8.2.8.2.4 0 .6-.3 1.1-.2.4 0 1.1.6 1.8.7.7 0 1.4-.2 2.1-.1 1.2 0 1.7.4 3.1 0 .4-.1.7-.4 1.1-.5.4 0 .8.1 1.2.1 1.1 0 1.9-.3 2.4-.8 1.5-1.4-.5-4.9.4-5.4.3-.2 1 0 2.5 1.4h2.7c1.5-1.4 2.1-1.5 2.4-1.3.9.6-.9 3.9.4 5.2.5.5 1.4.8 2.5.8 1.4 0 1 0 2.3.3 1.3.3 2.3-.2 3.2-.1.6 0 1 .3 1.8.2.7 0 1.3-.6 1.8-.7.8-.1 1.1.2 1.6.1.5-.1 1.1-.6 1.6-2.1 3.5.3 6.3 0 8.1-.5 2.8-.6 3.5-1.2 3.8-1.9.6-1.3-.5-2.9-.9-3.5Z', max: 1.3 }
  }};

createPictorialGraph({
  containerId: "container",
  title: "Height Comparison Graph",
  xAxis: { categories: ["Type"] },
  yAxis: { labels: { format: "{value} ft" } },
  legend: { enabled: true },
  shapes,

  buttonsSelector: "#options-wrapper button",
  colorModeSelector: 'input[name="color-mode"]'
});

```
<img width="1765" height="533" alt="image" src="https://github.com/user-attachments/assets/1575bf89-b904-46da-b256-a9da20ac3407" />

### **Waterfall Plot**  
Check out the [documentation](Documentation/WaterfallPlot.md)
```javascript
import { createWaterfallPlot } from 'funky-graphs';

createWaterfallPlot("./public/revenues.csv", // path of the csv
    'plotContainer', // html div id
    'dark', // color theme
    'title', // title of graph
    0, 0, 0, // 3d title pos (x,y,z)
    0, 5, 0, // iso title pos (x,y,z)
    'hello', 'Revenue', // x and y labels 
    1, // label distance from axes 
    2, // scaling label size
    1.1 // scaling tick size 
); 
```
<img width="900" height="897" alt="image" src="https://github.com/user-attachments/assets/3809c462-c3b3-4506-8e36-5763b06135e7" />

