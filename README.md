# DIDA-425-Frontend-Data-Viz
This is the documentation for Mina Lone, Asia Qin, Maddie Knopf, and Kathryn Chen's DIDA 425 capstone project. 

# What Is This Library? 

# Installation 

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
createWaterfallChart("#chart", data, {
  title: "Sales Waterfall",
  axes: {
    xLabel: "Stages",
    yLabel: "Value",
  },
  colors: {
    increase: "#4CAF50",
    decrease: "#F44336",
  },
  layout: {
    labelOffset: 1.2
  },
  fontScale: 1.3,
});

Dependencies: three.js, orbit controls, papa parse...

- accepted csv structure = (sliceBy, x, y, description ="")
- title of graph
- titles of axis labels
- color theme
- positioning for axis labels, tick marks, button (depending on scale of their data, they might need to manually reposition some stuff)
- size for font (maybe a multiplier across all of the text labels so everything scales up or down together)
