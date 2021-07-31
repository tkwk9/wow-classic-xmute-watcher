import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Chart, registerables } from "chart.js";
import {
  getZoomPlugin,
  getDiagonalBackgroundPlugin,
  getTooltipHighlightPlugin,
} from "@utils/custom-chart-js-plugins";
import Tooltip from "@components/tooltip";
import { TooltipItemIcon, Price } from "@components/icons";
import "@styles/market-chart.scss";

Chart.register(...registerables);

const ONE_DAY = 86400000;
const CHART_BASE_COLOR = [235, 222, 194];

let chart;

const MarketChart = ({ data, recipe, serverName, auctionHouseName }) => {
  const canvasRef = useRef(null);

  const [minMaxTimes, setMinMaxTimes] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    chart = new Chart(
      canvasRef.current,
      getChartOptions({
        plugins: [
          getTooltipHighlightPlugin({
            strokeColor: `rgba(${CHART_BASE_COLOR}, 1)`,
          }),
          getDiagonalBackgroundPlugin({
            strokeColor: `rgba(${CHART_BASE_COLOR}, 0.5)`,
          }),
          getZoomPlugin({
            afterZoom: () => setIsZoomed(true),
            strokeColor: `rgba(${CHART_BASE_COLOR}, 1)`,
            fillColor: `rgba(${CHART_BASE_COLOR}, 0.2)`,
            minZoomRange: ONE_DAY / 2,
          }),
        ],
        baseColor: `rgba(${CHART_BASE_COLOR}, 1)`,
      })
    );
  }, []);

  useEffect(() => {
    const { xmuteItem, ingredients } = recipe;

    let [maxPrice, minTime, maxTime] = [
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];

    data[xmuteItem.name].forEach((datum) => {
      maxPrice = Math.max(maxPrice, datum.y);
      minTime = Math.min(minTime, datum.x);
      maxTime = Math.max(maxTime, datum.x);
    });

    setMinMaxTimes({ minTime, maxTime });

    chart.options.scales.y1.max = maxPrice;
    chart.options.scales.y2.max = maxPrice;
    chart.options.scales.x.min = minTime;
    chart.options.scales.x.max = maxTime;

    chart.config.data = {
      datasets: [
        getXumteItemDataset(xmuteItem, data),
        ...ingredients.map((ingredient) =>
          getIngredientDataset(ingredient, data)
        ),
      ],
    };
    chart.update();
  }, [serverName, auctionHouseName, data, recipe]);

  return (
    <div className="MarketChart">
      <button
        className={`MarketChart-resetButton ${
          isZoomed ? "" : "MarketChart-resetButton--hide"
        }`}
        onClick={() => {
          setIsZoomed(false);
          const { minTime, maxTime } = minMaxTimes;
          chart.options.scales.x.min = minTime;
          chart.options.scales.x.max = maxTime;
          chart.update();
        }}
      >
        RESET ZOOM
      </button>
      <canvas ref={canvasRef} />
      <div className="MarketChart-customTooltipWrapper" />
    </div>
  );
};

const getCustomTooltip = (context) => {
  const {
    tooltip: {
      dataPoints: tooltipDataPoints,
      caretX: tooltipX,
      caretY: tooltipY,
      opacity: tooltipOpacity,
    },
    chart: {
      config: {
        data: { datasets },
      },
      chartArea: {
        left: chartLeft,
        top: chartTop,
        width: chartWidth,
        height: chartHeight,
      },
    },
  } = context;

  const tooltipWrapper = document.getElementsByClassName(
    "MarketChart-customTooltipWrapper"
  )[0];

  if (!tooltipDataPoints) return;
  if (tooltipOpacity === 0) {
    tooltipWrapper.style.opacity = 0;
    return;
  }
  tooltipWrapper.style.opacity = 1;

  const currentFocus = tooltipDataPoints[0];
  const { dataIndex, datasetIndex } = currentFocus;
  const date = currentFocus.parsed.x;

  const tooltipData = datasets.map((dataset, idx) => ({
    name: dataset.label,
    quantity: dataset.quantity,
    price: dataset.data[dataIndex].y,
    isSelected: datasetIndex === idx,
    iconImage: dataset.iconImage,
  }));

  const xmuteItem = tooltipData[0];
  const reagents = [...tooltipData.slice(1)].reverse();

  const profit =
    xmuteItem.price - reagents.reduce((acc, { price }) => acc + price, 0);

  const xMid = chartLeft + chartWidth / 2;
  const yMid = chartTop + chartHeight / 2;
  const tooltipOffset = 5;
  if (tooltipX < xMid) {
    if (tooltipY < yMid) {
      tooltipWrapper.style.left = tooltipX + tooltipOffset + "px";
      tooltipWrapper.style.top = tooltipY + tooltipOffset + "px";
      tooltipWrapper.style.right = null;
      tooltipWrapper.style.bottom = null;
    } else {
      tooltipWrapper.style.left = tooltipX + tooltipOffset + "px";
      tooltipWrapper.style.bottom =
        chart.canvas.clientHeight - tooltipY + tooltipOffset + "px";
      tooltipWrapper.style.right = null;
      tooltipWrapper.style.top = null;
    }
  } else {
    if (tooltipY < yMid) {
      tooltipWrapper.style.right =
        chart.canvas.clientWidth - tooltipX + tooltipOffset + "px";
      tooltipWrapper.style.top = tooltipY + tooltipOffset + "px";
      tooltipWrapper.style.left = null;
      tooltipWrapper.style.bottom = null;
    } else {
      tooltipWrapper.style.right =
        chart.canvas.clientWidth - tooltipX + tooltipOffset + "px";
      tooltipWrapper.style.bottom =
        chart.canvas.clientHeight - tooltipY + tooltipOffset + "px";
      tooltipWrapper.style.left = null;
      tooltipWrapper.style.top = null;
    }
  }

  const customTooltip = (
    <Tooltip>
      <div className="CustomTooltip-section">{getDateText(date)}</div>
      <div className={`CustomTooltip-xmuteItem`}>
        <TooltipItemIcon itemInfo={xmuteItem} />
        <div
          className={`CustomTooltip-xmuteItemName ${
            xmuteItem.isSelected ? "CustomTooltip-xmuteItemName--selected" : ""
          }`}
        >
          {xmuteItem.name}
        </div>
        <Price prefix={`:`} price={xmuteItem.price} />
      </div>
      <div className="CustomTooltip-profitText">Reagents:</div>
      {reagents.map((itemInfo) => (
        <div key={`${itemInfo.name}`} className={`CustomTooltip-reagent`}>
          <TooltipItemIcon itemInfo={itemInfo} />
          <div
            className={`CustomTooltip-reagentName ${
              itemInfo.isSelected ? "CustomTooltip-reagentName--selected" : ""
            }`}
          >
            {itemInfo.name}
          </div>{" "}
          <Price
            prefix={`${itemInfo.quantity ? `(x${itemInfo.quantity})` : ""}:`}
            price={itemInfo.price}
          />
        </div>
      ))}
      <div className="CustomTooltip-profitText">Profit: </div>
      <Price price={profit} />
    </Tooltip>
  );

  ReactDOM.render(customTooltip, tooltipWrapper);
};

const getXumteItemDataset = (itemInfo, data) => ({
  label: itemInfo.name,
  quantity: itemInfo.quantity,
  iconImage: itemInfo.iconImage,
  data: data[itemInfo.name],
  borderColor: `rgba(${itemInfo.color}, 1)`,
  yAxisID: "y2",
  borderWidth: 1,
  isXmuteItem: true,
  tension: 0.3,
});

const getIngredientDataset = (itemInfo, data) => ({
  label: itemInfo.name,
  quantity: itemInfo.quantity,
  iconImage: itemInfo.iconImage,
  data: getQuantityAdjustedData(data[itemInfo.name], itemInfo.quantity),
  borderColor: `rgba(${itemInfo.color}, 1)`,
  backgroundColor: `rgba(${itemInfo.color}, 0.2)`,
  yAxisID: "y1",
  fill: true,
  borderWidth: 1,
  isXmuteItem: false,
  tension: 0.3,
});

const getChartOptions = ({ plugins, baseColor }) => ({
  type: "line",
  plugins,
  options: {
    interaction: {
      intersect: false,
      mode: "nearest",
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
        hoverBorderWidth: 2,
      },
    },
    plugins: {
      title: {
        text: "AH Prices Over Time (Click and Drag to Zoom)",
        display: true,
        color: baseColor,
        padding: 20,
        font: {
          family: "Semplicita",
          size: 30,
        },
      },
      legend: {
        position: "bottom",
        labels: {
          color: baseColor,
          font: {
            family: "Semplicita",
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: false,
        position: "nearest",
        external: getCustomTooltip,
      },
    },
    scales: {
      y1: {
        title: {
          display: true,
          text: "Gold",
          color: baseColor,
          font: {
            family: "Semplicita",
            size: 20,
          },
        },
        grid: {
          display: false,
          borderColor: baseColor,
          borderWidth: 1,
        },
        min: 0,
        display: true,
        stacked: true,
        ticks: {
          color: baseColor,
          font: {
            family: "Semplicita",
            size: 12,
          },
          callback: getYAxisTick,
        },
      },
      y2: {
        min: 0,
        display: false,
        stacked: false,
      },
      x: {
        grid: {
          display: false,
          borderColor: baseColor,
          borderWidth: 1,
        },
        type: "linear",
        ticks: {
          color: baseColor,
          font: {
            family: "Semplicita",
            size: 12,
          },
          callback: getDateText,
        },
      },
    },
  },
});

const getQuantityAdjustedData = (itemData, quantity) =>
  itemData.map((datum) => ({ x: datum.x, y: datum.y * quantity }));

const getDateText = (d) => {
  const date = new Date(d);
  const hour = date.getHours();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const ampm = hour < 11 ? "am" : "pm";
  return `${month}/${day} ${hour % 11}${ampm}`;
};

const getYAxisTick = (g) => `${Math.floor(g / 10000)}G`;

export default MarketChart;
