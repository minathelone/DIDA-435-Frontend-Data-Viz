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
createWaterfallPlot(csv_file, div_container, color_theme, title, x_axis_label, y_axis_label, label_scale);
```
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
**div_container**: The id of the html div container that you want to host your waterfall plot in.   
**color_theme**: "dark" or "light"; toggles between a black or white background.  
**title**: The title for your visualization.
**x_axis_label**: The title for your x axis.  
**y_axis_label**: The title for you y axis.   
**label_scale**: Takes an integer or float to scale the size of the label size. The parameter multiplies the size of the default font (1).  

## Example Use And Output
