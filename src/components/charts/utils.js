import { CrosshairMode } from "lightweight-charts";

const resizesChart = (resizeObserver, chart, chartContainerRef) => () => {
    resizeObserver.current = new ResizeObserver(entries => {
        // we get the curret height and width of the objsevaable container
        const { width, height } = entries[0].contentRect;
        // apply it to the chart
        chart.current.applyOptions({ width, height });
        // make a time out so it looks smoother?
        setTimeout(() => {
            chart.current.timeScale().fitContent();
        }, 0);
    });
    resizeObserver.current.observe(chartContainerRef.current);
    return () => resizeObserver.current.disconnect();
}


const options = chartContainerRef => ({
    width: chartContainerRef.current.clientWidth,
    height: chartContainerRef.current.clientHeight,
    layout: {
        backgroundColor: "#253248",
        textColor: "rgba(255, 255, 255, 0.9)"
    },
    grid: {
        vertLines: {
            color: "#334158"
        },
        horzLines: {
            color: "#334158"
        }
    },
    crosshair: {
        mode: CrosshairMode.Normal
    },
    priceScale: {
        borderColor: "#485c7b"
    },
    timeScale: {
        borderColor: "#485c7b"
    }
});

export { resizesChart, options}