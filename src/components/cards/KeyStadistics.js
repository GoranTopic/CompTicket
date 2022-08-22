import ExpandablePaper from '../ExpandableCard.js';
import ParsedDataContent from '../cardContent/ParsedDataContent.js';

export default function KeyStadistics({ stocks }) {
    /* check if stock has default key stadistics,
    takes in a list of stocks as a parameter, filter out all but the active ones */
    const title = 'Finanacial Stadistics';
    // stock that we dont want to render
    const stockFilter = stock => (
        stock.active && // if it is not active, 
        stock.quoteSummary && // if it does not have quotesummery
        stock?.quoteSummary?.defaultKeyStatistics && // if ti does not have key Stadistics
        stock?.quoteSummary?.financialData // if it does not have the fiancial data
    )
    // filter stocks that are active and have a defaultKey Stadistics
    const activeStocks = stocks.filter(stockFilter);
    const subheader = `${activeStocks.map(s => s.shortname).join(', ')}'s financial Statistics`;

    // if not active stocks
    if (activeStocks.length === 0) return <></>
    // or if we have the data for it
    return <>
        <ExpandablePaper stocks={activeStocks} title={title} subheader={subheader} >
            <ParsedDataContent stocks={activeStocks} />
        </ExpandablePaper>
    </>
}