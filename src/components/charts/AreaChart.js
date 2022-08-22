import * as React from 'react';
import { createChart } from "lightweight-charts";
import { resizesChart, options } from './utils'

const colors = [
    { // cyan
        topColor: 'rgba(38,198,218, 0.56)',
        bottomColor: 'rgba(38,198,218, 0.04)',
        lineColor: 'rgba(38,198,218, 1)',
    }, { // yellow
        topColor: 'rgba(255, 192, 0, 0.7)',
        bottomColor: 'rgba(255, 192, 0, 0.3)',
        lineColor: 'rgba(255, 192, 0, 1)',
    }, { // green
        topColor: 'rgba(76, 175, 80, 0.5)',
        lineColor: 'rgba(76, 175, 80, 1)',
        bottomColor: 'rgba(76, 175, 80, 0)',
    }, { // purple
        topColor: 'rgba(156, 39, 176, 1)',
        bottomColor: 'rgba(41, 121, 255, 0.1)',
        lineColor: 'rgba(156, 39, 176, 0.8)'
    }, { // orange
        topColor: 'rgba(245, 124, 0, 0.4)',
        bottomColor: 'rgba(245, 124, 0, 0.1)',
        lineColor: 'rgba(245, 124, 0, 1)',
    }
]

export default function AreaChart({ areaData, labels }) {
    const chartContainerRef = React.useRef();
    const resizeObserver = React.useRef();
    const chart = React.useRef();
    //console.log('areaData:', areaData)
    //console.log('is array areaData:', Array.isArray(areaData))

    React.useEffect(() => {
        if (chart.current === undefined) { // use effect might run twice
            chart.current = createChart(
                chartContainerRef.current,
                options(chartContainerRef),
            );
            if (Array.isArray(areaData) && areaData.length > 0) {
                // if it is a aray of arrays
                if (areaData.every(data => Array.isArray(data))) {
                    // make a series of every array
                    areaData.forEach((data, i) => {
                        let areaSeries = chart.current.addAreaSeries({
                            ...colors[i],
                            lineWidth: 2,
                        });
                        areaSeries.setData(data);
                    });
                    // if it is an array of objects
                } else if (areaData.every(data => (typeof(data?.time) ==='number' && typeof(data?.value) === 'number'))) {
                    // if only one data is passed
                    let areaSeries = chart.current.addAreaSeries({
                        ...colors[0],
                        lineWidth: 2,
                    });
                    areaSeries.setData(areaData);
                    // if now is passed
                } else throw new Error(`Passed must be an array of objects of the form { time, value } or and array of arrays`)
                //if not a array passed
            } else throw new Error(`Passed paramter to AreaChart is not an array`)
            // handle mutiple areaData lines
        }
    }, []);

    // Resize chart on container resizes.
    React.useEffect(resizesChart(resizeObserver, chart, chartContainerRef), []);
    return <div ref={chartContainerRef} style={{ height: "100%", width: "100%" }}
    />
}