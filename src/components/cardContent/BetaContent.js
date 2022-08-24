import * as React from 'react';
import moment from 'moment';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/system';
import stylize from '../../utils/stylize'
import AreaChart from '../charts/AreaChart'
import Stadistics from 'statistics.js';

var bodyVars = {
        stock: 'metric',
        SDY: 'metric',
        time: 'metric',
    };
const stats = new Stadistics([], bodyVars);

moment().format();

const StyledCardContent = stylize(CardContent, ({ theme, $expand }) => ({
  transition: theme.transitions.create(['transform', 'width', 'height'], {
    duration: theme.transitions.duration.standard,
  }),
  // auto does not allow css transitions, bummer.
  // but auto is key so tidoesnot overflow in the phone size
  textAlign: 'left',
  maxWidth: 1200,
  transform: $expand ? 'scale(1)' : 'scale(0.8)',
  width: $expand ? '80vw' : 300,
  height: $expand ? 'auto' : 150, 
}));

var theme = createTheme();
theme = responsiveFontSizes(theme);

export default function DocContent({ expand, stocks }) {
    // get SDY data
    let SDY = stocks.at(-1);
    let timestampSDY = SDY.stockChart.timestamp;
    let indicatorsSDY = SDY.stockChart.indicators;
    let metaSDY = SDY.stockChart.meta;
    let adjcloseSDY = indicatorsSDY.adjclose[0].adjclose;
    let openSDY  = indicatorsSDY.quote[0].open;
    let closeSDY  = indicatorsSDY.quote[0].close;
    let highSDY  = indicatorsSDY.quote[0].high;
    // SDY analysis
    let firstCloseSDY = { time: moment.unix(timestampSDY.at(0)), value: adjcloseSDY.at(0).toFixed(2) }
    let lastCloseSDY = { time: moment.unix(timestampSDY.at(-1)), value: adjcloseSDY.at(-1).toFixed(2) }
    let timeSpanSDY = lastCloseSDY.time.diff(firstCloseSDY.time, 'years', true).toFixed(2);
    let rateOfReturnSDY = (Math.pow((lastCloseSDY.value / firstCloseSDY.value), (1 / timeSpanSDY)) - 1).toFixed(3)
    let returnsSDY = timestampSDY.map((time, i) => ({ time, value: ((closeSDY[i] - openSDY[i]) / openSDY[i]).toFixed(3) }))
    let retrnsStdDevSDY = stats.standardDeviation(returnsSDY.map(r => r.value)).toFixed(4);
    // get stock data
    let stock = stocks[0]; // analysis only for first stock
    let { timestamp, indicators, meta } = stock.stockChart;
    let adjclose = indicators.adjclose[0].adjclose;
    let { close, open, high } = indicators.quote[0];
    // stock analysis
    let firstClose = { time: moment.unix(timestamp.at(0)), value: adjclose.at(0).toFixed(2) }
    let lastClose = { time: moment.unix(timestamp.at(-1)), value: adjclose.at(-1).toFixed(2) }
    let timeSpan = lastClose.time.diff(firstClose.time, 'years', true).toFixed(2);
    let rateOfReturn = (Math.pow((lastClose.value / firstClose.value), (1 / timeSpan)) - 1).toFixed(3)
    let returns = timestamp.map((time, i) => ({ time, value: ((close[i] - open[i]) / open[i]).toFixed(3) }))
    let retrnsStdDev = stats.standardDeviation(returns.map(r => r.value)).toFixed(4);

    // get correlationn
    let corData = (returns.length <= returnsSDY.length) ?
        returns.map((r, i) => ({ time:r.time, stock: high[i], SDY: highSDY[i] })) :
        returnsSDY.map((r, i) => ({ time:r.time, stock: high[i], SDY: highSDY[i] }));
    let corStats = new Stadistics(corData, bodyVars);
    let { correlationCoefficient } = corStats.correlationCoefficient('stock', 'SDY')


    return <>
        <StyledCardContent $expand={expand}>
            <ThemeProvider theme={theme}>
                <Box sx={{ paddingX: '6%', marginY: '3%' }}>
                    <Typography variant="h4">
                        Calculatin the Beta of {stock.shortname} with the S&P 500
                    </Typography>
                    <Typography>
                        The Beta is a mesure of the volatility of a Stock has. Thus it is a mesure of how much change does the stock has in price, over a period of time.
                    </Typography>
                    <Typography>
                        However, to find the volatility of the sock we need isolate the changes in the sotck from the overall changes in the market. We can find the changes in the market by getting the historial values of a index fund, like the S&P 500, which reflects the changes in the 500 most profitable comapnies in the US.
                    </Typography>
                    <Typography>
                        To find the Beta of {stock.symbol} we need to divide the standard deviation of the returns of {stock.symbol} by the standard deviation of the returns of S&P 500.
                    </Typography>
                    <Typography>
                        Then we multiply it by the correlation of the {stock.symbol} and the S&P 500.
                    </Typography>
                    <Typography>
                        To calcualte the standard deviation of the return we must first find the average return of the {stock.symbol}. From our rate of return analysis we know that the Annualized Rate of Return is: {rateOfReturn}%
                    </Typography>
                    <Typography>
                        Using the same process we can fin the SDY's Annualized Rate of Return to be {rateOfReturnSDY}%;
                    </Typography>
                    <Typography>
                        Form the opening can losing value we calculating rate of return of everyday for the {stock.symbol} and the S&P 500. What we get a list of values of th the return and the timestamp.
                    </Typography>
                    <Typography>
                        With this list we can calcualte the the standard deviation. Which will turn out to be {retrnsStdDev} for {stock.symbol} and {retrnsStdDevSDY} for S&P 500.
                    </Typography>
                    <Typography>
                        If we divide {retrnsStdDev} / {retrnsStdDevSDY} we get: {(retrnsStdDev / retrnsStdDevSDY).toFixed(3)} which we now have to multiply by the correlation of the {stock.symbol} and the S&P 500.
                    </Typography>
                    <Typography>
                        Before we do that let's chart the data to get a feeling of the correlation between {stock.symbol} (Blue) and the S&P 500 (Yellow) returns.
                    </Typography>
                    {((returnsSDY && returns) ? <AreaChart areaData={[returns, returnsSDY]} /> : <></>)}
                    <Typography>
                        Now that we can visualize the two data for the stock we can see how correlation coefficient is: {correlationCoefficient.toFixed(5)}.
                    </Typography>
                    <Typography>
                        With this final peice of information we can calculate the Beta of {stock.shortname} by finding: {correlationCoefficient.toFixed(5)} * ({retrnsStdDev} / {retrnsStdDevSDY})  =  {(correlationCoefficient * (retrnsStdDev / retrnsStdDevSDY)).toFixed(3)}
                    </Typography>
                    <Typography>
                        The Beta provided by the Yahoo Finance API for the Stock {stock.symbol} is: {stock.quoteSummary.defaultKeyStatistics?.beta?.fmt ?? "(Beta Not found)"}
                    </Typography>
                </Box>
            </ThemeProvider>
        </StyledCardContent>
    </>
}