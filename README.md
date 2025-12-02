# DIDA-435-Frontend-Data-Viz
This is the documentation for Mina Lone, Asia Qin, Maddie Knopf, and Kathryn Chen's DIDA 425 capstone project. 

# What Is This Library? 

# Installation 

# Pictorial Charts: Height Comparison
The Pictorial Chart, specifically for comparing the height of two different objects, uses vector images to visualize data.

 Setting up:
The attached code has already provided a sample of how you can edit the axes units, replace SVG paths, and add new objects to the graph.

Replacing Images:
Once you have your vector path ready, use the [SVG Path Editor](https://yqnn.github.io/svg-path-editor/) to crop and resize the image so that it fits the height of the object.

# Radial Histogram 

# Butterfly Chart 

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
