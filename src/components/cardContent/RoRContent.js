import * as React from 'react';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/system';
import stylize from '../../utils/stylize.js'
import moment from 'moment';

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
    let [rors, setRORS] = React.useState(Array(stocks.length));
    React.useEffect(() => {
        let rates = stocks.map(stock => {
            let { timestamp, indicators, meta } = stock.stockChart;
            let adjclose = indicators.adjclose[0].adjclose ?? indicators.adjclose;
            let firstClose = { time: moment.unix(timestamp.at(0)), value: adjclose.at(0).toFixed(2) }
            let lastClose = { time: moment.unix(timestamp.at(-1)), value: adjclose.at(-1).toFixed(2) }
            let timeSpan = lastClose.time.diff(firstClose.time, 'years', true).toFixed(2);
            return { stock, adjclose, firstClose, lastClose, timeSpan, meta }
        })
        setRORS([...rates]);
    }, [stocks])

    return <>
        <StyledCardContent $expand={expand}>
            <ThemeProvider theme={theme}>
                {rors.map(({ stock, timeSpan, lastClose, firstClose, meta }, i) => <Box key={i}>
                    <Typography variant="h4" sx={{ alignText: 'center' }}>{stock.shortname}'s Annual Rate of Return</Typography>
                    <Typography>The rate of return of a asset can tell us how much excess value has the asset generated over a period of time.
                        In most case we can caculate this by subtracting the final value of the asset by the initial value and dividint it by inital value:
                        We might not have 20 years of value for all stocks, but for {stock.shortname} we have {timeSpan} years worth of data
                        Starting from {firstClose.time.format('MMMM Do YYYY')}, where the adjusted close value for {stock.shortname} was {firstClose.value} {meta.currency},
                        to {lastClose.time.format('MMMM Do YYYY')}, where the  adjusted close value for {stock.shortname} was {lastClose.value} {meta.currency}.
                    </Typography>
                    <Typography>
                        Assuming that we do not count the account the divident of the stock over ther year.
                    </Typography>
                    We can calculate the Rate of Return by subtracting the final invesment by the initla invesment,
                    the dividing it by the inital invesment.
                    <Typography>
                        If we had bought 1 stock of {stock.symbol} over {timeSpan} years ago out inital invesment would have been: {firstClose.value} {meta.currency} that invemsnet would be worth {lastClose.value} {meta.currency} now.
                    </Typography>
                    <Typography>
                        if we subtract ({lastClose.value} - {firstClose.value}) / {firstClose.value} = {((lastClose.value - firstClose.value) / firstClose.value).toFixed(3)} * 100 = {(((lastClose.value - firstClose.value) / firstClose.value) * 100).toFixed(3)}%
                    </Typography>
                    <Typography>
                        However this is only the return of invement over the entire {timeSpan} years. To caculate the Rate of Return for each year we need to find the Annualized Rate of Return
                    </Typography>
                    <Typography variant="h5">
                        Annualized Rate of Return
                    </Typography>
                    <Typography>
                        To caculate this we for our one stock of {stock.symbol} we must divide the ending vaule of the invement by the initial value of the invesment then root square to the number of years minus one thus:
                    </Typography>
                    <Typography>
                        The Annualized Rate of Return is: ({lastClose.value} / {firstClose.value}) ^ (1/{timeSpan}) - 1  = {(Math.pow((lastClose.value / firstClose.value), (1 / timeSpan)) - 1).toFixed(3)}%
                    </Typography>
                </Box>
                )}
            </ThemeProvider>
        </StyledCardContent>
    </>
}