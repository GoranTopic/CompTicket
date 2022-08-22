import React from 'react';
import ExpandableCard from '../ExpandableCard.js';
import WACCContent from '../cardContent/WACCContent';

export default function WACC({ stocks, index }) {
    const title = 'WACC';
    // stock that we dont want to render
    const stockFilter = stock => (
        stock.active && // if it is not active, 
        stock.quoteSummary && // if it does not have quotesummery
        // income stament to calc the wacc
        stock.balanceSheet &&
        stock.cashFlow &&
        stock.incomeStatment
    )
    // filter stocks that are active and have a defaultKey Stadistics
    const activeStocks = stocks.filter(stockFilter);
    // if not active stocks
    if (activeStocks.length === 0) return <></>
    // subtitle title
    const subheader = `Calcualte the Weighted Average Cost of Capital (WACC) of ${activeStocks[0].shortName}`;
    // or if we have the data for it
    return <>
        <ExpandableCard stocks={activeStocks} title={title} subheader={subheader} >
            <WACCContent stocks={activeStocks} />
        </ExpandableCard>
    </>
}