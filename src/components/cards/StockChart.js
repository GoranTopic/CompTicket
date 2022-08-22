import ExpandablePaper from '../ExpandableCard.js';
import ChartContent from '../cardContent/ChartContent.js';

export default function StockChart({ stocks, setStocks }) {
    /* check if stock has default key stadistics,
    takes in a list of stocks as a parameter, filter out all but the active ones */
    const title = 'Stock Value';
    const subheader = `${stocks.map(s => s.shortname).join(', ')}'s Stock Price`;
    // stock that we dont want to render
    const stockFilter = stock => (
        stock.active && // if it is not active, 
        stock.stockChart // if it does not have 
    )
    // filter stocks that are active and have a defaultKey Stadistics
    const activeStocks = stocks.filter(stockFilter);
    // if not active stocks
    if (activeStocks.length === 0) return <></>
    // or if we have the data for it
    return <>
        <ExpandablePaper stocks={activeStocks} title={title} subheader={subheader} >
            <ChartContent stocks={activeStocks} setStock={setStocks} />
        </ExpandablePaper>
    </>
}