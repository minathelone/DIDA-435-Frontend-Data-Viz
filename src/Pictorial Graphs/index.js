
export function createPictorialGraph({
  containerId = 'container',
  title = 'Pictorial Chart',
  xAxis = { categories: ['Type'] },
  yAxis = { labels: { format: '{value}' } },
  legend = { enabled: true },
  shapes = {},
}) {
  const activeShapes = {};

  // Initialize the Highcharts pictorial chart
  let chart = Highcharts.chart(containerId, {
    chart: { type: 'pictorial' },
    title: { text: title },
    xAxis,
    yAxis,
    legend,
    series: []
  });


  function toggleShape(type, buttonElement = null) {
    if (!shapes[type]) {
      console.error(`Shape "${type}" was not found in shapes object`);
      return;
    }


    if (activeShapes[type]) {
      const index = activeShapes[type].seriesIndex;
      chart.series[index].remove();
      delete activeShapes[type];

      if (buttonElement) buttonElement.classList.remove('active');


      chart.series.forEach((s, i) => {
        const key = s.userOptions.key;
        if (activeShapes[key]) activeShapes[key].seriesIndex = i;
      });

    } else {
      const s = shapes[type];

      const newSeries = chart.addSeries({
        key: type,
        name: s.name,
        data: [s.value],
        color: s.color,
        paths: [s.paths]
      });

      activeShapes[type] = {
        seriesIndex: chart.series.length - 1
      };

      if (buttonElement) buttonElement.classList.add('active');
    }
  }

  return { chart, toggleShape };
}
  return { chart, toggleShape };
}


