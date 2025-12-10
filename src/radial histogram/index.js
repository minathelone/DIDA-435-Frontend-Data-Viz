export function createRadicalHistogram(
  jsonFile,
  svgId,
  theme = "dark",
  width = 600,
  height = 600,
  innerRadius = 150,
  categoryKey = null 
) {
    
  const svg = d3.select(`#${svgId}`);
  if (svg.empty()) {
    console.error(`No SVG found with id="${svgId}"`);
    return;
  }

  const radius = Math.min(width, height) / 2;

  svg.attr("width", width).attr("height", height);

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);


  // THEME COLORS
  const darkColors = ["#9999ff", "#ff9999", "#99ff99", "#ffff99"];
  const lightColors = ["#3366cc", "#ff6666", "#66cc66", "#ffcc33"];

  const chosenColors = theme === "dark" ? darkColors : lightColors;
  const backgroundColor = theme === "dark" ? "#000" : "#fff";
  const labelColor = theme === "dark" ? "#fff" : "#000";

  // Optional: change page background/text
  d3.select("body")
    .style("background-color", backgroundColor)
    .style("color", labelColor)
    .style("font-family", "Poppins, system-ui, sans-serif");


  let data = [];
  let originalData = [];
  let numericKeys = [];
  let currentKey = null;
  let extraKeys = [];
  let catKey = categoryKey; 


  let tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "white")
      .style("padding", "8px 10px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0);
  }

  function formatLabel(key) {
    return key
      .replace(/_/g, " ")
      .replace(/\./g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function draw() {
    chartGroup.selectAll("*").remove();

    const N = data.length;
    if (!N) return;

    const layers = [currentKey, ...extraKeys];
    const barThickness = (radius - innerRadius) / layers.length;

    const angle = d3.scaleLinear()
      .domain([0, N])
      .range([0, Math.PI * 2]);

    const values = data.map(d => d[currentKey]);
    const minVal = d3.min(values);
    const maxVal = d3.max(values);

    const colorScale = d3.scaleQuantize()
      .domain([minVal, maxVal])
      .range(chosenColors);

    layers.forEach((varName, layerIndex) => {
      const inner = innerRadius + layerIndex * barThickness;
      const outer = inner + barThickness;

      const scale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[varName] || 0)])
        .range([inner, outer]);

      chartGroup.selectAll(".layer-" + layerIndex)
        .data(data)
        .enter()
        .append("path")
        .attr("class", "layer-" + layerIndex)
        .attr("d", (d, i) =>
          d3.arc()
            .innerRadius(inner)
            .outerRadius(scale(d[varName] || 0))
            .startAngle(angle(i))
            .endAngle(angle(i + 1) - 0.03)()
        )
        .attr("fill", d =>
          layerIndex === 0
            ? colorScale(d[varName])
            : chosenColors[layerIndex % chosenColors.length]
        )
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mousemove", (event, d) => {
          tooltip.html(
            Object.entries(d)
              .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
              .join("<br>")
          );
          tooltip.style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 20 + "px")
            .style("opacity", 1);
        })
        .on("mouseleave", () => tooltip.style("opacity", 0));
    });

    // Center label
    chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 10)
      .attr("fill", labelColor)
      .style("font-size", "16px")
      .style("font-family", "Poppins")
      .text(formatLabel(currentKey));
  }

  // LOAD JSON DATA
  d3.json(jsonFile)
    .then(jsonData => {
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        console.error("JSON file does not contain an array with data:", jsonData);
        return;
      }

      originalData = jsonData.slice();
      data = jsonData.slice();

      const sample = data[0];

      // numeric keys: auto-detect
      numericKeys = Object.keys(sample).filter(
        k => typeof sample[k] === "number"
      );
      if (!numericKeys.length) {
        console.error("No numeric fields found in data to visualize.");
        return;
      }

      currentKey = numericKeys[0]; // default main metric

      // category key: either use param, or auto-guess a string field
      if (!catKey) {
        catKey = Object.keys(sample).find(k => typeof sample[k] === "string");
      }

      console.log("Numeric keys:", numericKeys);
      console.log("Category key:", catKey);

      // Initial draw
      draw();
    })
    .catch(err => {
      console.error("Failed to load or parse JSON:", err);
    });


  // BUTTON HANDLERS
  const sortValueBtn = document.getElementById("sortValue");
  const sortCategoryBtn = document.getElementById("sortCategory");
  const resetBtn = document.getElementById("reset");

  if (sortValueBtn) {
    sortValueBtn.onclick = () => {
      if (!currentKey) return;
      data.sort((a, b) => b[currentKey] - a[currentKey]);
      draw();
    };
  }

  if (sortCategoryBtn) {
    sortCategoryBtn.onclick = () => {
      if (!catKey) {
        console.warn("No category key available for sorting.");
        return;
      }
      data.sort((a, b) => d3.ascending(a[catKey], b[catKey]));
      draw();
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (!originalData.length) return;
      data = originalData.slice();
      draw();
    };
  }
}
