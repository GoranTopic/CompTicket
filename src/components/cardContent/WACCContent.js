import * as React from 'react';
import moment from 'moment';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
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

    let longTermDebt = stock.balanceSheet['longTermDebt']?.longFmt ?? stock.balanceSheet['longTermDebt']?.raw;
    let shortTermDebt = stock.balanceSheet['shortLongTermDebt']?.longFmt ?? stock.balanceSheet['shortLongTermDebt']?.raw;
    let cash = stock.balanceSheet['cash']?.longFmt ?? stock.balanceSheet['cash']?.raw;
    let totalDebt = stock.quoteSummary.financialData["totalDebt"]['raw'] ?? (
        stock.balanceSheet['longTermDebt']['raw'] +
        stock.balanceSheet['shortLongTermDebt']['raw'] +
        stock.balanceSheet['accountsPayable']['raw']
    ) - stock.balanceSheet['cash']['raw'];
    //console.log("total debt:", totalDebt)
    let USRiskFreePremium = 2.79; // magic...

    // Beta
    let beta = stock.quoteSummary.defaultKeyStatistics?.beta?.fmt // ?? custom beta
    //console.log('beta:', beta);

    // rate of return 
    let { timestamp, indicators } = stock.stockChart;
    let adjclose = indicators.adjclose[0].adjclose ?? indicators.adjclose;
    let firstClose = { time: moment.unix(timestamp.at(0)), value: adjclose.at(0) }
    let lastClose = { time: moment.unix(timestamp.at(-1)), value: adjclose.at(-1) }
    let timeSpan = lastClose.time.diff(firstClose.time, 'years', true).toFixed(2);
    let rateOfReturn = (Math.pow((lastClose.value / firstClose.value), (1 / timeSpan)) - 1).toFixed(3)
    //console.log('ror', rateOfReturn)
    
    let costOfEquity = USRiskFreePremium + (beta * rateOfReturn);

    //console.log('cost of equity:', costOfEquity);

    let currentinteresetRate = "2.25%-2.5%";
    let interesetRate = 2.30;

    let equityAndDebt = totalEquity + totalDebt;
    let equityProportion = totalEquity / equityAndDebt;
    let debtProportion = totalDebt / equityAndDebt;

    let proportionalCostOfEquity = (equityProportion * costOfEquity)
    let proportionalCostOfDebt = debtProportion *  interesetRate;

    let WACC = (proportionalCostOfEquity + proportionalCostOfDebt)

    return <>
        <StyledCardContent $expand={expand}>
            <ThemeProvider theme={theme}>
                <Typography variant="h4"> The Weighted Average Cost of Capital </Typography>
                <Typography > The Weighted Average Cost of Capital (WACC) is a mesure of how is the money raised going to cost a company. It is often used a internal mesurement for a company to figure out whether it will be profitable to inestin a poject or not. However it is also used by inverstor who want to know the state of a company.  </Typography>
                <Typography> The formula for the WACC is: <b>WACC = (% Proportion of Equity * Cost of Equity) + (% Proportion of Debt * Cost of Debt * (1 - Tax Rate))</b> </Typography>
                <Typography> Where the <b>Proportion of Equity</b> is the ammount of equity that the company has in relation to Equity + Debt </Typography>
                <Typography> The <b>Proportion of Debt</b> is the ammount of Debt that the company has in relation to Equity + Debt </Typography>
                <Typography> The <b>Cost of Equity</b> is the current value of stock</Typography>
                <Typography> The <b>Cost of Debt</b> is price of the debt? </Typography>
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
                <Typography> Equity Proportion = Total Equity ({totalEquity}) / Total Equity + Total Debt ({equityAndDebt}) = {equityProportion} </Typography>
                <Typography> Debt Proportion = Total Debt ({totalDebt}) / Total Equity + Total Debt ({equityAndDebt}) = {debtProportion} </Typography>
                <Typography> <b>Step 2: Determine the Cost of Equity: </b> </Typography>
                <Typography> Not all companies dive off dividents, thus the usual way of calcualting the Cost Of Equity which involve the dividents of Share / price of the stock, might not work</Typography>
                <Typography> I have thus chosen to use the CAPM Approach: (Rate Of Return) + Beta * (Market Risk Free Rate of Return) </Typography>
                <Typography> The Beta of the company is: {beta}, the current risk free rate of return is: {USRiskFreePremium}, and the companies current rate of return is: {rateOfReturn} </Typography>
                <Typography> if we plug this value into the formula we find that the Cost of Equity is {costOfEquity} </Typography>
                <Typography> <b>Step 3: Determine the Cost of Debt: </b></Typography>
                <Typography> I am going to use the curret intereset rate in the United States as the cost of debt of the company which is {interesetRate} </Typography>
                <Typography> <b>Step 4: Determine the WACC</b></Typography>
                <Typography> Ideally we would like to find the tax rate of the company, however I was unable to find reliable and programable information fro this websit, thus we are going to only count the proportial cost of debt and the proportial cost of equity</Typography>
                <Typography> The WACC can be found by adding the Proportional Cost of Equity with the Proportial Cost of Debt </Typography>
                <Typography> thus: WACC = (Debt Proportion ({debtProportion}) * Cost of Debt ({interesetRate})) + (Equity Proportion ({equityProportion}) * Cost of Equity ({costOfEquity})) = {WACC} </Typography>
            </ThemeProvider>
        </StyledCardContent>
    </>
}