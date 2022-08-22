import React from 'react';
import ExpandableCard from '../ExpandableCard.js';
import WeightedPortafolioContent from '../cardContent/WeightedPortafolioContent';

export default function WeightedPortafolio({stocks}) {
    const title = 'Weighted Portafolio';
    // subtitle title
    const subheader = `What is the best way to divide our invesment`;
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
    // or if we have the data for it
    return (activeStocks.length >= 2) ? //only render if we have more than one stock
        <ExpandableCard stocks={activeStocks} title={title} subheader={subheader} >
            <WeightedPortafolioContent stocks={activeStocks} />
        </ExpandableCard> :
        <></>
}