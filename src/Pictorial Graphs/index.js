export function createPictorialGraph({
  containerId = 'container',
  title = 'Pictorial Chart',
  xAxis = { categories: ['Type'] },
  yAxis = { labels: { format: '{value}' } },
  legend = { enabled: true },
  shapes = {},
  buttonsSelector = null,
  colorModeSelector = null
}) {
  const activeShapes = {};

  // Create Highcharts pictorial graph
  const chart = Highcharts.chart(containerId, {
    chart: { type: 'pictorial' },
    title: { text: title },
    xAxis,
    yAxis,
    legend,
    series: []
  });

  // Toggle logic
  function toggleShape(type, buttonElement = null) {
    if (!shapes[type]) {
      console.error(`Shape "${type}" does not exist.`);
      return;
    }

    if (activeShapes[type]) {
      const index = activeShapes[type].seriesIndex;
      chart.series[index].remove();
      delete activeShapes[type];

      if (buttonElement) buttonElement.classList.remove('active');

      // Re-index series
      chart.series.forEach((s, i) => {
        const key = s.userOptions.key;
        if (activeShapes[key]) activeShapes[key].seriesIndex = i;
      });

    } else {
      const s = shapes[type];

      chart.addSeries({
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

  // Auto-bind buttons
  if (buttonsSelector) {
    document.querySelectorAll(buttonsSelector).forEach(btn => {
      btn.addEventListener('click', () => {
        toggleShape(btn.dataset.type, btn);
      });
    });
  }


  if (colorModeSelector) {
    document.querySelectorAll(colorModeSelector).forEach(input => {
      input.addEventListener('click', e => {
        document.getElementById(containerId).className =
          e.target.value === 'none'
            ? ''
            : `highcharts-${e.target.value}`;
      });
    });
  }

  return { chart, toggleShape };
}
