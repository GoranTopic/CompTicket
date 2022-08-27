import * as React from 'react';
import moment from 'moment';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/system';
import stylize from '../../utils/stylize'

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
    let stock = stocks.at(0);

    let totalLiab = stock.balanceSheet['totalLiab']['longFmt'];
    let totalAssets = stock.balanceSheet['totalAssets']['longFmt'];
    let totalEquity = stock.balanceSheet['totalAssets']['raw'] - stock.balanceSheet['totalLiab']['raw'];
    //console.log("totalEquity:", totalEquity)

    let longTermDebt = stock.balanceSheet['longTermDebt']?.raw;
    let shortTermDebt = stock.balanceSheet['shortLongTermDebt']?.raw;
    let cash = stock.balanceSheet['cash']?.longFmt ?? stock.balanceSheet['cash']?.raw;
    let totalDebt = stock.quoteSummary.financialData["totalDebt"]['raw'] ?? (
        stock.balanceSheet['longTermDebt']['raw'] +
        stock.balanceSheet['shortLongTermDebt']['raw'] +
        stock.balanceSheet['accountsPayable']['raw']
    ) - stock.balanceSheet['cash']['raw'];
    //console.log("total debt:", totalDebt)

    let USRiskFreePremium = 2.81; // magic...

    // Beta
    let beta = stock.quoteSummary.defaultKeyStatistics?.beta?.fmt // ?? custom beta
    //console.log('beta:', beta);

    // rate of return 
    let { timestamp, indicators } = stock.stockChart;
    let adjclose = indicators.adjclose[0].adjclose ?? indicators.adjclose;
    let firstClose = { time: moment.unix(timestamp.at(0)), value: adjclose.at(0) }
    let lastClose = { time: moment.unix(timestamp.at(-1)), value: adjclose.at(-1) }
    let timeSpan = lastClose.time.diff(firstClose.time, 'years', true).toFixed(2);
    let rateOfReturn = (Math.pow((lastClose.value / firstClose.value), (1 / timeSpan)) - 1)*100
    //console.log('ror', rateOfReturn)
    
    let costOfEquity = USRiskFreePremium + (beta * rateOfReturn);

    //console.log('cost of equity:', costOfEquity);
    let interesetRate = 2.30;

    let equityAndDebt = totalEquity + totalDebt;
    let equityProportion = (totalEquity / equityAndDebt);
    let debtProportion = (totalDebt / equityAndDebt);

    let proportionalCostOfEquity = (equityProportion * costOfEquity);
    let proportionalCostOfDebt = (debtProportion *  interesetRate);

    let WACC = (proportionalCostOfEquity + proportionalCostOfDebt);

    return <>
        <StyledCardContent $expand={expand}>
            <ThemeProvider theme={theme}>
                <Box sx={{ paddingX: '6%', marginY: '3%' }}>
                    <Typography variant="h4"> The Weighted Average Cost of Capital </Typography>
                    <Box sx={{ paddingX: '2%', marginY: '1%' }}>
                        <Typography > The Weighted Average Cost of Capital (WACC) is a measure of how is the money raised going to cost a company. It is often used an internal measurement for a company to figure out whether it will be profitable to invest in a project. However, it is also used by investor who want to know the state of a company.  </Typography>
                        <Typography> The formula for the WACC is: <b>WACC = (% Proportion of Equity * Cost of Equity) + (% Proportion of Debt * Cost of Debt * (1 - Tax Rate))</b> </Typography>
                        <Typography> Where the <b>Proportion of Equity</b> is the amount of equity that the company has in relation to Equity + Debt </Typography>
                        <Typography> The <b>Proportion of Debt</b> is the amount of Debt that the company has in relation to Equity + Debt </Typography>
                        <Typography> The <b>Cost of Equity</b> is the current value of stock</Typography>
                        <Typography> The <b>Cost of Debt</b> is the interest on the borrowed money </Typography>
                        <Typography> The <b>Tax Rate</b> is how high are the taxes for thr debt</Typography>
                        <Typography> The proportion of equity and proportion of debt are found by dividing the total assets of a company by each respective account.  </Typography>
                        <Typography> Thus the Proportion of Debt = Total Assets / Total Debt </Typography>
                        <Typography> Thus the Proportion of Equity = Total Assets / Total equity </Typography>
                        <Typography> Since all assets are financed via equity or debt, total equity plus total liabilities should equal 100%. This assumes any operating liabilities like accounts payable are excluded.  </Typography>
                        <Typography> <b>Step 1: Determine the debt-to-equity proportions. </b> </Typography>
                        <Typography> This can be determined by dividing the Total Equity by the Total Equity and the Total Debt like so: </Typography>
                        <Typography> Total Equity / (Total Equity + the Total Debt). In the case of {stock.shortname} we know that the total equity is the total Assets: {totalAssets} - the total liabilities: {totalLiab} = {totalEquity}  </Typography>
                        <Typography> Total debt can be found by the formula by adding the long term debt({longTermDebt}) and the short term debt ({shortTermDebt}) minus the cash ({cash}) = {totalDebt} </Typography>
                        <Typography> Now that we have the Total Debt ({totalDebt}) and the total Equity ({totalEquity}) we can calcualte the proportions of each by the formula: </Typography>
                        <Typography> Equity Proportion = Total Equity ({totalEquity}) / Total Equity + Total Debt ({equityAndDebt}) = {equityProportion.toFixed(4)} </Typography>
                        <Typography> Debt Proportion = Total Debt ({totalDebt}) / Total Equity + Total Debt ({equityAndDebt}) = {debtProportion.toFixed(4)} </Typography>
                        <Typography> <b>Step 2: Determine the Cost of Equity: </b> </Typography>
                        <Typography> Not all companies pay off dividends, thus the usual way of calculating the Cost Of Equity which involve the dividents of Share / price of the stock, might not work</Typography>
                        <Typography> I have thus chosen to use the CAPM Approach: (Rate Of Return) + Beta * (Market Risk Free Rate of Return) </Typography>
                        <Typography> The Beta for {stock.shortname} is: {beta}, the current risk free rate of return is: {USRiskFreePremium}, and the companies current rate of return is: {rateOfReturn.toFixed(4)}% </Typography>
                        <Typography> if we plug this value into the formula we find that the Cost of Equity is {costOfEquity} </Typography>
                        <Typography> <b>Step 3: Determine the Cost of Debt: </b></Typography>
                        <Typography> I am going to use the current interest rate in the United States as the cost of debt of the company which is {interesetRate} (U.S. Department of the Treasury, 2022) </Typography>
                        <Typography> <b>Step 4: Determine the WACC</b></Typography>
                        <Typography> Ideally we would like to find the tax rate of the company, however I was unable to find reliable and programmable information for this website, thus we are going to only count the proportional cost of debt and the proportional cost of equity</Typography>
                        <Typography> The WACC can be found by adding the Proportional Cost of Equity with the Proportional Cost of Debt </Typography>
                        <Typography> thus: WACC = (Debt Proportional ({debtProportion.toFixed(4)}) * Cost of Debt ({interesetRate.toFixed(4)})) + (Equity Proportion ({equityProportion.toFixed(4)}) * Cost of Equity ({costOfEquity.toFixed(4)})) = {WACC.toFixed(4)} </Typography>
                    </Box>
                </Box>
            </ThemeProvider>
        </StyledCardContent>
    </>
}