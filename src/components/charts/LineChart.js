import { createChart, CrosshairMode } from 'lightweight-charts';
import React, {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { options } from './utils'

const Context = createContext();

export default function LineChart({stocks}) {

    const [chartLayoutOptions, setChartLayoutOptions] = useState({});
    // The following variables illustrate how a series could be updated.
    const [series, setSeries]  = useState([...stocks]);

    useEffect(() => {
        let newSeries = stocks.map(s => ({
            // add the series
            ref: s.ref,
            data: s.data,
            color: s.color,
        }))
        setSeries([...newSeries])
    }, [stocks]);

    useEffect(() => {
        setChartLayoutOptions({
            background: {
                color: "#253248",
            },
            textColor: "rgba(255, 255, 255, 0.9)"
        });
    }, []);

    return <Chart layout={chartLayoutOptions} >
        {series.map((s, i) =>
            <Series key={i}
                ref={s.ref}
                type={'area'}
                data={s.data}
                color={s.color}
            />
        )}
    </Chart>
};

export function Chart(props) {
	const [container, setContainer] = useState(false);
	const handleRef = useCallback(ref => setContainer(ref), []);

	return (
		<div ref={handleRef} style={{ height: "100%", width: "100%" }} >
			{container && <ChartContainer {...props} container={container} />}
		</div>
	);
}

export const ChartContainer = forwardRef((props, ref) => {
	const { children, container, layout, ...rest } = props;
    const resizeObserver = React.useRef();

    const chartApiRef = useRef({
        api() {
            if (!this._api) {
                this._api = createChart(container, {
                    ...rest,
                    layout,
                    width: container.clientWidth,
                    height: 300, // does not work with the height //container.clientHeight,
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
                this._api.timeScale().fitContent();
            }
            return this._api;
        },
        free() {
            if (this._api) {
                this._api.remove();
            }
        },
    });

    useLayoutEffect(() => {
        /* custom rezise */
        const currentRef = chartApiRef.current;
		const chart = currentRef.api();
        resizeObserver.current = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            console.log('width container:', width)
            console.log('height container:', height)
            // apply it to the chart
            chart.applyOptions({ width, height });
            // make a time out so it looks smoother?
            setTimeout(() => {
                chart.timeScale().fitContent();
            }, 100);
        });
        resizeObserver.current.observe(container);
        return () => resizeObserver.current.disconnect();
	}, []);


	useLayoutEffect(() => {
		const currentRef = chartApiRef.current;
		currentRef.api();
	}, []);

	useLayoutEffect(() => {
		const currentRef = chartApiRef.current;
		currentRef.api().applyOptions(rest);
	}, []);

	useImperativeHandle(ref, () => chartApiRef.current.api(), []);

	useEffect(() => {
		const currentRef = chartApiRef.current;
		currentRef.api().applyOptions({ layout });
	}, [layout]);


	return (
		<Context.Provider value={chartApiRef.current}>
			{props.children}
		</Context.Provider>
	);
});
ChartContainer.displayName = 'ChartContainer';

export const Series = forwardRef((props, ref) => {
	const parent = useContext(Context);
	const context = useRef({
		api() {
			if (!this._api) {
				const { children, data, type, ...rest } = props;
				this._api = type === 'line'
					? parent.api().addLineSeries(rest)
					: parent.api().addAreaSeries(rest.color);
				this._api.setData(data);
			}
			return this._api;
		},
		free() {
			if (this._api) {
				parent.free();
			}
		},
	});

	useLayoutEffect(() => {
		const currentRef = context.current;
		currentRef.api();
		return () => currentRef.free();
	}, []);

	useLayoutEffect(() => {
		const currentRef = context.current;
		const { children, data, ...rest } = props;
		currentRef.api().applyOptions(rest);
	});

	useImperativeHandle(ref, () => context.current.api(), []);

	return (
		<Context.Provider value={context.current}>
			{props.children}
		</Context.Provider>
	);
});
Series.displayName = 'Series';