import * as React from 'react';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import { Box } from '@mui/system';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function ChipsArray({stocks, setStocks, sortByStock}) {

    const handleDelete = stock => () => 
    /* handle the delete, by taking the stock out of the stock array */
        setStocks(stocks.filter(s => stock.symbol !== s.symbol));

    const toogleShown = stock => () =>
        /* ahdnle click by toggeling if the stock is shown */
        setStocks(stocks.map(s => (stock.symbol === s.symbol) ?
            { ...stock, active: !stock.active } :
            s)
        );

    const isDataComplete = stock =>
        /* if stock has all the listed data */
        [
            'quoteSummary',
            'stockChart'
        ].every(key => stock[key] ? true : false);

    return (
        <Box sx={{
            marginY: "5%",
            display: 'flex',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            minWidth: 200,
            listStyle: 'none',
            p: 0.5,
            m: 0,
        }} component="ul" >
            {stocks.map((stock, i) => {
                return <ListItem key={i}>
                    <Chip
                        // if we don't got the data for that stock
                        sx={{
                            //clickableColorPrimary: 'yellow.main',
                            backgroundColor: stock.color.topColor,
                            //color: 'white.main',
                            //colorPrimary: 'yellow.main',
                            //clickableColorSecondary: stock.color.lineColor,
                            //outlinedPrimary: 'yellow.main',
                        }}
                        //color={isDataComplete(stock)? "yellow": "warning"}
                        variant={(stock.active)? "" : "outlined"}
                        onClick={toogleShown(stock)}
                        label={stock.symbol}
                        onDelete={handleDelete(stock)}
                    />
                </ListItem>
            }
            )}
        </Box>
    );
}