import * as React from 'react';
import { createChart } from "lightweight-charts";
import { resizesChart, options } from './utils'

export default function ChandleStickChart({ candleStickData, volumeData }) {
  const chartContainerRef = React.useRef();
  const chart = React.useRef();
  const resizeObserver = React.useRef();

  React.useEffect(() => {
    if (chart.current === undefined) { // use effect might run twice
      chart.current = createChart(
        chartContainerRef.current,
        options(chartContainerRef),
       );

      const candleSeries = chart.current.addCandlestickSeries({
        upColor: "#4bffb5",
        downColor: "#ff4976",
        borderDownColor: "#ff4976",
        borderUpColor: "#4bffb5",
        wickDownColor: "#838ca1",
        wickUpColor: "#838ca1"
      });

      candleSeries.setData(candleStickData);

      const volumeSeries = chart.current.addHistogramSeries({
        color: "#182233",
        lineWidth: 2,
        priceFormat: {
          type: "volume"
        },
        overlay: true,
        scaleMargins: {
          top: 0.8,
          bottom: 0
        }
      });
      volumeSeries.setData(volumeData);
    }
  }, []);

  // Resize chart on container resizes.
  React.useEffect( resizesChart(resizeObserver, chart, chartContainerRef), []);

  return <div ref={chartContainerRef} style={{ height: "100%", width: "100%" }} />
}