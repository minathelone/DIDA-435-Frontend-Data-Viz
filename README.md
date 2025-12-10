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


# Pictorial Charts: Height Comparison
The Pictorial Chart, specifically for comparing the height of different objects, uses vector images to visualize data.

 Setting up:
The attached code provides a sample of how to edit the axes units, replace SVG paths, and add new objects to the graph.

Replacing Images:
When opening up your SVG file, click inspect and copy the path. 
Once you have your vector path ready, use the [SVG Path Editor](https://yqnn.github.io/svg-path-editor/) to crop and resize the image so that it fits the height of the object. [Tip: Make sure your image is at the center of the x-axis and almost touching the y-axis.]

Parameters:
1. Replace the property names with your appropriate data information, including your SVG paths that you want to compare.
```javascript
const myChart = createPictorialChart({
    containerId: ' ',
    chartTitle: ' ',
    yAxisFormat: '{value} ',
    xAxisCategory: ' ',
    shapes: {property1: {
            name: ' ',
            value: [],
            color: ' ',
            paths: {definition: '', max: []}},

            property2: {
                name: ' ',
                value: [],
                color: ' ',
                paths: {
                definition: ' ', 
                max: []}}}
```
2. Add the appropriate buttons to the HTML file in the appropriate div
```html
<div id="options-wrapper">
  <button data-type="person">Human</button>
  <button data-type="animal1">Cat</button>
</div>
```

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
You'll need to have set up a div to host the plot. This plot also requires that you have an html button, for which you can simply copy and paste this snippet into your file: 
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



