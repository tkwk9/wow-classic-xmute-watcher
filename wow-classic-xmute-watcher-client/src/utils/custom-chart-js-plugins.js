export const getZoomPlugin = ({
  afterZoom = () => {},
  strokeColor,
  fillColor,
  minZoomRange,
}) => {
  let mouseDownLocation = null;
  let mouseDownXVal = null;
  let mouseDragLocation = null;

  return {
    afterInit: (chart) => {
      const { canvas } = chart;

      canvas.addEventListener("mousedown", (event) => {
        const {
          chartArea: { width, top, bottom, left, right },
        } = chart;

        // If mouse down outside of chart area, return
        if (
          event.offsetY > bottom ||
          event.offsetY < top ||
          event.offsetX > right ||
          event.offsetX < left
        )
          return;

        mouseDownLocation = event.offsetX;

        // Calculate x axis (time) value of the mouse down location
        const xPercentage = (mouseDownLocation - left) / width;
        mouseDownXVal = Math.floor(
          chart.scales.x.min +
            (chart.scales.x.max - chart.scales.x.min) * xPercentage
        );
        chart.update();
      });

      canvas.addEventListener("mousemove", (event) => {
        const {
          chartArea: { left, right },
        } = chart;
        const tempMouseDragLocation = event.offsetX;

        if (
          mouseDownLocation !== null &&
          // Don't update mouseDragLocation if out of bounds
          // This makes is so that the mouseDragLocation
          // remains at min/max when the mouse is moved out
          // of the chart area, but still within the canvas
          left < tempMouseDragLocation &&
          right > tempMouseDragLocation
        ) {
          mouseDragLocation = tempMouseDragLocation;
        }
      });

      canvas.addEventListener("mouseleave", () => {
        // Remove all stored values once mouse leaves the canvas
        mouseDownLocation = null;
        mouseDownXVal = null;
        mouseDragLocation = null;
        chart.update();
      });

      canvas.addEventListener("mouseup", () => {
        if (mouseDownLocation) {
          const {
            chartArea: { width, left },
          } = chart;

          // Calculate x axis (time) value of the last mouse location
          const xPercentage = (mouseDragLocation - left) / width;
          const mouseUpXVal = Math.floor(
            chart.scales.x.min +
              (chart.scales.x.max - chart.scales.x.min) * xPercentage
          );

          if (
            // Don't zoom in for less than minimum zoom range. for us, this is 12 hours
            Math.abs(mouseDownXVal - mouseUpXVal) > minZoomRange &&
            mouseDownXVal >= chart.scales.x.min &&
            mouseDownXVal <= chart.scales.x.max &&
            mouseUpXVal >= chart.scales.x.min &&
            mouseUpXVal <= chart.scales.x.max
          ) {
            chart.options.scales.x.max = Math.max(mouseDownXVal, mouseUpXVal);
            chart.options.scales.x.min = Math.min(mouseDownXVal, mouseUpXVal);

            // Call afterZoom cb. For us, this makes "Reset Zoom" button show up
            afterZoom();
          }

          mouseDownLocation = null;
          mouseDownXVal = null;
          mouseDragLocation = null;
          chart.update();
        }
      });
    },
    // Draw zoom indicator based on mouse locations set by handlers on canvas
    afterDraw: (chart) => {
      if (mouseDownLocation) {
        const {
          ctx,
          chartArea: { top, bottom, height },
        } = chart;

        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;

        ctx.beginPath();
        ctx.moveTo(mouseDownLocation, top);
        ctx.lineTo(mouseDownLocation, bottom);
        ctx.stroke();
        if (mouseDragLocation) {
          ctx.beginPath();
          ctx.moveTo(mouseDragLocation, top);
          ctx.lineTo(mouseDragLocation, bottom);
          ctx.stroke();
          ctx.fillRect(
            Math.min(mouseDownLocation, mouseDragLocation),
            top,
            Math.abs(mouseDownLocation - mouseDragLocation),
            height
          );
        }

        ctx.restore();
      }
    },
  };
};

export const getDiagonalBackgroundPlugin = ({ strokeColor }) => ({
  beforeDraw: (chart) => {
    const { ctx, chartArea } = chart;
    const {
      left: chartLeft,
      bottom: chartBottom,
      top: chartTop,
      right: chartRight,
      height: chartHeight,
    } = chartArea;

    const patternThickness = 30;
    let xTarget;

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = strokeColor;

    for (
      let xStart = chartLeft + patternThickness;
      xStart < chartRight;
      xStart = xStart + patternThickness
    ) {
      const triangleWidth = xStart - chartLeft;
      let triangleHeight = Math.tan((45 * Math.PI) / 180) * triangleWidth;
      xTarget = chartLeft;
      if (triangleHeight > chartHeight) {
        const diff = triangleHeight - chartHeight;
        xTarget = chartLeft + Math.tan((45 * Math.PI) / 180) * diff;
      }
      const yTarget = Math.min(chartTop + triangleHeight, chartBottom);

      ctx.beginPath();
      ctx.moveTo(xStart, chartTop);
      ctx.lineTo(xTarget, yTarget);
      ctx.stroke();
    }

    for (
      let xStart = xTarget + patternThickness;
      xStart < chartRight;
      xStart = xStart + patternThickness
    ) {
      const triangleHeight =
        Math.tan((45 * Math.PI) / 180) * (chartRight - xStart);
      const yTarget = chartTop + chartHeight - triangleHeight;

      ctx.beginPath();
      ctx.moveTo(xStart, chartBottom);
      ctx.lineTo(chartRight, yTarget);
      ctx.stroke();
    }
    ctx.restore();
  },
});

export const getTooltipHighlightPlugin = ({ strokeColor }) => ({
  beforeDraw: (chart) => {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const {
        ctx,
        tooltip: { caretX: x },
        chartArea: { top, bottom },
      } = chart;

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.restore();
    }
  },
  beforeDatasetDraw: (chart, { meta }) => {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const { datasetIndex } = chart.tooltip.dataPoints[0];
      meta.dataset.options.borderWidth = meta.index === datasetIndex ? 2 : 1;
    }
  },
});
