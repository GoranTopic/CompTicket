import * as React from 'react';
import CardContent from '@mui/material/CardContent';
import stylize from '../../utils/stylize.js'
//import ChandleStickChart from '../charts/CandleStickChart.js';
//import AreaChart from '../charts/AreaChart.js';
import LineChart from '../charts/LineChart.js';

const StyledCardContent = stylize(CardContent, ({ theme, $expand }) => ({
  transition: theme.transitions.create(['transform', 'width', 'height'], {
    duration: theme.transitions.duration.standard,
  }),
  // auto does not allow css transitions, bummer.
  // but auto is key so tidoesnot overflow in the phone size
  textAlign: 'center',
  justifyContent: 'stretch',
  maxWidth: 1200,
  transform: $expand ? 'scale(1)' : 'scale(0.8)',
  width: $expand ? '85vw' : 300,
  height: $expand ? '45vw' : 150,
}));

export default function ChartContent({ expand, stocks }) {
  // Use lightweight chart tutorial to complete the chart compnenet propertly updating the values
  // https://tradingview.github.io/lightweight-charts/tutorials/react/advanced
      let [candleStickData, setCandleStickData] = React.useState([]);
      let [volumeData, setVolumeData]  = React.useState([]);
      let [areaData, setAreaData] = React.useState([]);
      /* parse data from stocks */

  React.useEffect(() => {
    stocks.forEach(stock => {
      let newCandleStickData = [];
      let newVolumeData = [];
      let newAreaData = [];
      /* parse data from stocks */
      let { timestamp, indicators } = stock.stockChart;
      // get the stocks indicators 
      let { open, close, high, low, volume } = indicators.quote[0];
      // parse data
      timestamp.forEach((time, i) => {
        // candle stick data
        newCandleStickData.push({ time: time, open: open[i], close: close[i], high: high[i], low: low[i] });
        // volume data
        newVolumeData.push({ time: time, value: volume[i] });
        // area data
        newAreaData.push({ time: time, value: high[i] });
      });
      setCandleStickData([...candleStickData, newCandleStickData]);
      setVolumeData([...volumeData, newVolumeData]);
      setAreaData([...areaData, {...stock, data: newAreaData}]);
    })
  }, [stocks]);

  return <>
    <StyledCardContent $expand={expand}>
      {
        //false ?  ((candleStickData && volumeData) ? <ChandleStickChart candleStickData={candleStickData} volumeData={volumeData} /> : <></>) : (areaData.length? <AreaChart areaData={areaData} /> : <></>)
      }
      <LineChart stocks={areaData} />
    </StyledCardContent>
  </>
}