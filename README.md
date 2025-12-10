# 🎨 funky-graphs
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

# Pictorial Charts: Height Comparison
The Pictorial Chart, specifically for comparing the height of different objects, uses vector images to visualize data.

 Setting up:
The attached code provides a sample of how to edit the axes units, replace SVG paths, and add new objects to the graph.

Replacing Images:
When opening up your SVG file, click inspect and copy the path. 
Once you have your vector path ready, use the [SVG Path Editor](https://yqnn.github.io/svg-path-editor/) to crop and resize the image so that it fits the height of the object. [Tip: Make sure your image is at the center of the x-axis and almost touching the y-axis.]

Adjusting the Code:
1. Replace the property names with your appropriate data information
2. Replace the path that has been scaled and transformed using the SVG Path Editor
3. Add the appropriate buttons to the HTML file


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



