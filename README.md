# 🎨📈 funky-graphs
A JavaScript library for creating advanced, interactive 3D data visualizations in the browser. Built with various JavaScript libraries for stunning visual effects.

# Installation and Setting Up Your Environment
1. Install via npm (write this in the terminal): 
```bash
npm install funky-graphs
```
2. Set up an HTML file and create a div to host your graph:
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
3. Create a javascript file and import the graph(s) of your choice:
```javascript
import { createWaterfallPlot } from 'funky-graphs';
```
4. Call the function and pass the relevant data and parameters in!
```javascript
createWaterfallPlot('./data.csv', 'chart-container', 'light', 'Time', 'Revenue');
```

# Radial Histogram 
```javascript
  createRadicalHistogram(jsonFile,
  svgId,
  theme,
  width,
  height,
  innerRadius,
  categoryKey
  );
```
<img width="646" height="651" alt="Screen Shot 2025-12-09 at 11 46 41 PM" src="https://github.com/user-attachments/assets/c18941c1-5cb2-45a1-852a-59616f17af4f" />

## Setup
```html
<div id="chart-container">
    <svg id="radial-histogram"></svg>
</div>

<div id="controls">
    <button id="sortValue">Sort: Most → Least</button>
    <button id="sortCategory">Sort: Category</button>
    <button id="reset">Reset</button>
</div>
```
## Parameters
### **jsonFile**: 
```
[ {"title":"Inception","genre":"Sci-Fi","minutes_watched":540000,"unique_viewers":230000,"rating":8.8},
  {"title":"Barbie","genre":"Comedy","minutes_watched":720000,"unique_viewers":310000,"rating":7.1},
  {"title":"Oppenheimer","genre":"Drama","minutes_watched":690000,"unique_viewers":280000,"rating":8.6},
  {"title":"Parasite","genre":"Thriller","minutes_watched":410000,"unique_viewers":200000,"rating":8.5},
  {"title":"Get Out","genre":"Horror","minutes_watched":350000,"unique_viewers":150000,"rating":7.7}
]
```
### *svgId*: 
(string) The id of the html div container that you want to host your waterfall plot in.   
### *theme*: 
(string: "dark" or "light"); toggles between a black or white background.  
### *width*: 
(int) The title for your visualization.  
### *height*: 
(nt) To adjust the (x,y,z) positioning of the title in the full 3D view. The parameter increments default (x/y/z) position.
### *innerRadius*: 
(int) To adjust the (x,y,z) positioning of the title in the isolated slice view. The parameter adds to the default (x/y/z) position.
### *categoryKey*: 
(string) The title for your x axis.  

## Example Use and Output



# Butterfly Chart 
```javascript
createButterflyChart({
  containerSelector,
  statusSelector,
  sortButtonSelector,
  labels,
  dataSource,
  chartTitle,
  initialMode
});
```
<img width="1170" height="695" alt="butterfly-main" src="https://github.com/user-attachments/assets/8b16c4c0-78dd-4088-8027-46d936aba91f" />


---

## Setup

You'll need to have set up a div to host the plot. This plot also expects a status element and a sort button. You can copy and paste this snippet into your HTML file:

```html
<button id="sortBtn">
  Sorted by Diff
</button>

<p id="statusMsg"></p>

<div id="chart"></div>

<div id="tip"></div>
<div id="detailScreen"></div>

<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script type="module" src="./new.js"></script>
```

Note that this visualization expects the ids to match the parameters you pass:

- `containerSelector` should point to `#chart`.
- `statusSelector` should point to `#statusMsg`.
- `sortButtonSelector` should point to `#sortBtn`.

You can change these ids as long as you also update the corresponding parameters in the function call.

---

## Parameters

```javascript
createButterflyChart({
  containerSelector,
  statusSelector,
  sortButtonSelector,
  labels,
  dataSource,
  chartTitle,
  initialMode
});
```

### *containerSelector*
(string) CSS selector for the HTML div that will host the butterfly plot.

Example: `'#chart'`.

---

### *statusSelector*
(string or null) CSS selector for the element where the chart writes status messages, such as
"Showing top 20 of 20 categories alphabetically by category."  

Example: `'#statusMsg'`.

---

### *sortButtonSelector*
(string or null) CSS selector for the HTML button that toggles the sort mode (A–Z vs by difference).  

Example: `'#sortBtn'`.

---

### *labels*
(object) Text labels for the left and right sides of the butterfly chart.

Example:
```javascript
labels = {
  left: 'Exports',
  right: 'Imports'
};
```

- `left`: Label shown above the left side of the chart.
- `right`: Label shown above the right side of the chart.

---

### *dataSource*
(object) Configuration for loading and mapping your data.

```javascript
dataSource = {
  type: 'csv',
  url: 'countries.csv',
  categoryCol: 'country',
  leftCol: 'exports',
  rightCol: 'imports',
  rightScale: 1
};
```

- **type** (string)  
  Data format. For this project, `'csv'`.

- **url** (string)  
  File path or name of the CSV relative to the HTML file.

- **categoryCol** (string)  
  Column name used for category labels (y‑axis). For example, `'country'`.

- **leftCol** (string)  
  Column name for numeric values plotted on the left side (e.g. `'exports'`).

- **rightCol** (string)  
  Column name for numeric values plotted on the right side (e.g. `'imports'`).

- **rightScale** (float or int)  
  Optional scale factor that multiplies the right‑side values after loading. Default is `1`.

A valid CSV for this configuration looks like:

```csv
country,child_mort,exports,health,imports,income,inflation,life_expectation,total_fer,gdpp
Afghanistan,90.2,10,7.58,44.9,1610,9.44,56.2,5.82,553
Albania,16.6,28,6.55,48.6,9930,4.49,76.3,1.65,4090
Algeria,27.3,38.4,4.17,31.4,12900,16.1,76.5,2.89,4460
...
```

Here:

- `categoryCol` → `country`  
- `leftCol` → `exports`  
- `rightCol` → `imports`

---

### *chartTitle*
(string) The title shown at the top of the page and in the header.

Example: `'Exports vs Imports by Country'`.

---

### *initialMode*
(string: `'dark'` or `'light'`)  
Controls the color theme of the chart.

- `'dark'` → dark background, light text.  
- `'light'` → light background, dark text.

If omitted, the default is `'dark'`.

---

## Example Use And Output

```javascript
import { createButterflyChart } from './index.js';

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
<img width="1066" height="409" alt="butterfly-detail" src="https://github.com/user-attachments/assets/1681c930-438f-4f43-9cfb-e8ede6fa6143" />


# Pictorial Graphs: Height Comparison
The Pictorial Graph, specifically for comparing the height of different objects, uses vector images to visualize data.

 Setting up:
The attached code provides a sample of how to edit the axes units, replace SVG paths, and add new objects to the graph.

Replacing Images:
When opening up your SVG file, click inspect and copy the path. 
Once you have your vector path ready, use the [SVG Path Editor](https://yqnn.github.io/svg-path-editor/) to crop and resize the image so that it fits the height of the object. [Tip: Make sure your image is at the center of the x-axis and almost touching the y-axis.]
```javascript
const shapes = {
   property1: {
    name: ' ',
    value: [ ],
    color: ' ',
    paths: { definition: '', max: [ ] }
  },
};

const { chart, toggleShape } = createPictorialGraph({
  containerId: ' ',
  title: ' ',
  xAxis: { categories: [' '] },
  yAxis: { labels: { format: '{ } ' } },
  legend: { enabled: true },
  shapes
});
```

## Setup 
<div id="options-wrapper"> 
 <button data-type="property1">Name1</button>
   <button data-type="property2">Name2</button>
 <button data-type="property3 ">Name3</button>
## Parameters
### *property*: 
(string) The id of the html div container that you want to host your pictorial graph in.  

### *name*: 
(string) The name of the image you want it to be.  

### *value*: 
(string) The height you want your image to be.  

### *color*: 
(string) The color you want your image to be.  

### *path and max*: 
(string) The SVG file you'd like to replace

### *containerID*: 
(string) Type of container you want

### *xAxis*: 
(string) The name of the x-axis you want your graph to be.

### *yAxis*: 
(string) The name of the y-axis you want your graph to be, and its unit of measure.

### *legend*: 
(string) Set to true or false.


## Example Use And Output
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

const { chart, toggleShape } = createPictorialChart({
  containerId: 'container',
  title: 'Height Comparison Graph',
  xAxis: { categories: ['Type'] },
  yAxis: { labels: { format: '{value} ft' } },
  legend: { enabled: true },
  shapes
});
```
<img width="883" height="267" alt="Image" src="https://github.com/user-attachments/assets/ccbf6344-a2be-4356-aa89-c71b2e1e61b1" />

# Waterfall Plot
```javascript
createWaterfallPlot(csv_file,
div_container,
color_theme,
title,
title_x, title_y, title_z,
title_x2, title_y2, title_z2,
x_axis_label, y_axis_label,
label_offset, label_scale
tick_scale);
```
<img width="569" height="578" alt="Screenshot 2025-12-09 at 1 13 10 PM" src="https://github.com/user-attachments/assets/e53dae07-8e00-4c70-93e4-96483b4b51df" />

## Setup 
You'll need to have set up a div to host the plot. This plot also requires that you have an html button and a tooltip, for which you can simply copy and paste this snippet into your file: 
```html
<button id="backButton" style="
          display: none;
          position: absolute;
          top: 50%;
          left: 30%;
          transform: translateX(-50%);
          padding: 10px 20px;
          background-color: #9999ff;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          transition: background-color 0.2s, transform 0.1s;
      ">
          Back to 3D View
</button>
<div id="chart-tooltip"></div>
```
Note that this visualization does not support dynamic placement of the button, so you'll have to adjust the position manually. You can also adjust the style to your liking by manually editing the CSS. Note that the id of the button **must be** "backButton".

## Parameters
**csv_file**: The file path to a csv. The csv must have the following structure: slice, x, y
The "slice" column should contain the variable that you want to organize the datasets by (ex: slice by company). 
"x" and "y" are values that the function will use to "draw" the slices. An example valid csv would be as follows: 
```
slice,x,y  
Apple,1,2.74,"Apple revenue in 2020 (in trillions USD)"  
Apple,3,3.65,"Apple revenue in 2021 (in trillions USD)"  
Microsoft,1,1.43,"Microsoft revenue in 2020 (in trillions USD)"  
Microsoft,3,1.68,"Microsoft revenue in 2021 (in trillions USD)"   
Google,1,1.82,"Google revenue in 2020 (in trillions USD)"  
Google,3,2.57,"Google revenue in 2021 (in trillions USD)"  
```
### *div_container*: 
(string) The id of the html div container that you want to host your waterfall plot in.   
### *color_theme*: 
(string: "dark" or "light"); toggles between a black or white background.  
  
### *title*: 
(string) The title for your visualization.  
### *title_x, title_y, title_z*: 
(float or int) To adjust the (x,y,z) positioning of the title in the full 3D view. The parameter increments default (x/y/z) position.
  
### *title_x2, title_y2, title_z2*: 
(float or int) To adjust the (x,y,z) positioning of the title in the isolated slice view. The parameter adds to the default (x/y/z) position.
  
### *x_axis_label*: 
(string) The title for your x axis.  
### *y_axis_label*: 
(string) The title for you y axis. 
### *label_offset*:
(floar or int) To adjust how far the labels sit from the axis. The parameter adds to the vertical/horizontal distance from the axis. 
### *label_scale*: 
(float or int) The parameter multiplies the size of the default font (1).  
### *tick_scale*: 
(float or int) The parameter multiplies the size of the default font (1).  

## Example Use And Output
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
<img width="450" height="449" alt="Screenshot 2025-12-09 at 1 09 44 PM" src="https://github.com/user-attachments/assets/3d57d049-2967-4872-9ede-a04ceedf47cd" />

<img width="431" height="455" alt="Screenshot 2025-12-09 at 1 10 03 PM" src="https://github.com/user-attachments/assets/0fe2fd77-d08b-4f2f-b335-9fe866d9ddeb" />



