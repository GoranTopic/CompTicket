import React from 'react';
import ExpandableCard from '../ExpandableCard.js';
import BetaContent from '../cardContent/BetaContent';
import { query_all_modules, query_stock_chart } from '../../queries/query_yahoo.js';

// this is for homework purpouse only
const load_quotesummery_SPY = async stock => {
    /* this function queries all the modules of the S&P 500 */
    let response = await query_all_modules(stock);
    console.log('reponse from SPY:', response)
    // if there was a error
    if (response.data.quoteSummary.error)
        throw new Error(response.data.quoteSummary.error)
    return response.data.quoteSummary.result[0];
}

const load_chart_SPY = async stock => {
    let response = null;
    let metrics = 'high';
    let interval = '1mo';
    let range = '20y';
    // modules to query
    response = await query_stock_chart(stock, { metrics, interval, range });
    console.log('reponse from stockChart:', response)
    // if there was a error
    if (response.data.chart.error)
        throw new Error(response.data.chart.error)
    return response.data.chart.result[0]
}

export default function RateOfReturn({ stocks, index }) {
    /* check if stock has default key stadistics,
    takes in a list of stocks as a parameter, filter out all but the active ones */
    const title = 'Beta';
    const subheader = `Calcualte the Beta in relation to the S&P 500`;
    const [SDY, setSDY] = React.useState({});

  React.useEffect(() => {
    /* quries data fro th stock to the APi */
    // start quetirs
    (async () => {
      let data = { symbol: 'SPY' };
      await Promise.all([
        // query quote summery
        load_quotesummery_SPY(data)
          .then(res => data['quoteSummary'] = res),
        // query stock chart
        load_chart_SPY(data)
          .then(res => data['stockChart'] = res)
      ]);
      setSDY({
        ...data,
        color: {
          topColor: 'rgb(186,182,182, 0.56)',
          bottomColor: 'rgb(186,182,182, 0.04)',
          lineColor: 'rgb(186,182,182, 1)',
        },
        active: true
      });
    })()
  }, []);


    // stock that we dont want to render
    const stockFilter = stock => (
        stock.active && // if it is not active, 
        stock.quoteSummary && // if it does not have quotesummery
        stock.stockChart && // we need to chart 
        stock.index
    )
    // filter stocks that are active and have a defaultKey Stadistics
    const activeStocks = stocks.filter(stockFilter);
    // if not active stocks
    if (activeStocks.length === 0) return <></>
    // or if we have the data for it
    return <>
        <ExpandableCard stocks={[ ...activeStocks, SDY ]} title={title} subheader={subheader} >
            <BetaContent stocks={[ ...activeStocks, SDY ]} index={index} />
        </ExpandableCard>
    </>
}