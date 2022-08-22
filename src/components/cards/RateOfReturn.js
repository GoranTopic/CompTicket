import ExpandableCard from '../ExpandableCard.js';
import RoRContent from '../cardContent/RoRContent';

export default function RateOfReturn({ stocks }) {
    /* check if stock has default key stadistics,
    takes in a list of stocks as a parameter, filter out all but the active ones */
    const title = 'Rate of Return';
    const subheader = "Calcualte the Rate of Return and the Annualized Rate of Return";
    // stock that we dont want to render
    const stockFilter = stock => (
        stock.active && // if it is not active, 
        stock.quoteSummary && // if it does not have quotesummery
        stock.stockChart // we need to chart 
    )
    // filter stocks that are active and have a defaultKey Stadistics
    const activeStocks = stocks.filter(stockFilter);

    // if not active stocks
    if (activeStocks.length === 0) return <></>
    // or if we have the data for it
    return <>
        <ExpandableCard stocks={activeStocks} title={title} subheader={subheader} >
            <RoRContent stocks={activeStocks} />
        </ExpandableCard>
    </>
}