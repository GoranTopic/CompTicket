import ExpandablePaper from '../ExpandableCard.js';
import StatmentContent from '../cardContent/FinancialTableContent';

export default function FinancialStatements({ stocks }) {
    /* check if stock has default key stadistics,
    takes in a list of stocks as a parameter, filter out all but the active ones */
    const title = 'Finanacial Statments';
    //console.log('indside finanical stament cards:', stocks)
    // stock that we dont want to render
    const stockFilter = stock => (
        stock.active && // if it is not active, 
        stock.balanceSheet &&
        stock.cashFlow &&
        stock.incomeStatment // if it does not have quotesummery
    )
    // filter stocks that are active and have a defaultKey Stadistics
    const activeStocks = stocks.filter(stockFilter);
    const subheader = `${activeStocks.map(s => s.shortname).join(', ')}'s financial Statments`;
    // if not active stocks
    if (activeStocks.length === 0) return <></>
    // or if we have the data for it
    return <>
        <ExpandablePaper stocks={activeStocks} title={title} subheader={subheader} >
            <StatmentContent stocks={activeStocks} />
        </ExpandablePaper>
    </>
}