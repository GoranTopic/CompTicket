import * as React from 'react';
import moment from 'moment';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import stylize from '../../utils/stylize'
//import AreaChart from '../charts/AreaChart'
import { Box } from '@mui/material';
import CanvasJSReact from '../../utils/canvasjs.react';
import Stadistics from 'statistics.js';
import weight_combinator from '../../utils/weights_combinatinos';
import { TextField } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

var bodyVars = {
    stock: 'metric',
    SDY: 'metric',
};

const stats = new Stadistics([], bodyVars);


moment().format();

const StyledCardContent = stylize(CardContent, ({ theme, $expand }) => ({
  transition: theme.transitions.create(['transform', 'width', 'height'], {
    duration: theme.transitions.duration.standard,
  }),
  textAlign: 'left',
  maxWidth: 1200,
  transform: $expand ? 'scale(1)' : 'scale(0.8)',
  width: $expand ? '80vw' : 300,
  height: $expand ? 'auto' : 150, 
}));

var theme = createTheme();
theme = responsiveFontSizes(theme);

const calcCorrelationCoefficient = (returns1, returns2) => {
    let corData = returns1.length <= returns2.length ?
        returns1.map((v, i) => ({ stock1: parseFloat(returns1[i]), stock2: parseFloat(returns2[i]) })) :
        returns2.map((v, i) => ({ stock1: parseFloat(returns1[i]), stock2: parseFloat(returns2[i]) }));
    var bodyVars = { stock1: 'metric', stock2: 'metric' };
    let corStats = new Stadistics(corData, bodyVars);
    return corStats.correlationCoefficient('stock1', 'stock2').correlationCoefficient
}

const uniqueCombinations = list => {
    /* calcualte the correlation coefiecent between every posible pair of stock */
    let combinations = []
    for (var [index, value] of list.entries())
        while (++index < list.length)
            combinations.push([value, list[index]]);
    return combinations
}

const calcReturn = (weights, stocks) => {
    // calculate the returns of a given wight and r
    let returns = stocks.map(s => s.mean); // use the mean
    if (weights.length !== returns.length)
        return console.error('weight and returns array must be the same length');
    return weights.reduce((total, weight, i) =>
        total + (weight * returns[i])
    );
}

const calcRisk = (weights, stocks, correlations) => {
    /*Portfolio Risk = √ [(Weight of A1^2 * Standard Deviation of A1^2) + (Weight of A2^2 * Standard Deviation of A2^2) + (2 X Correlation Coefficient * Standard Deviation of A1 * Standard Deviation of A2)],*/
    // check is the stocks match the weights
    if (weights.length !== stocks.length)
        return console.error('weights and stocks array must be the same length');
    // takes a list of weight and a stdDev object with both stds, and 
    let stocksRisk = stocks
        .map(s => s.standardDeviation) // get the std Dev
        .reduce((total, stdDev, i) =>
            total + (Math.pow(weights[i], 2) * Math.pow(stdDev, 2))
        );
    let correlatedRisk = correlations
        .map(c => c.correlation) // get the correlations
        .reduce((total, correlation) =>
            total + (2 * correlation.correlation * correlation.stdDev1 * correlation.stdDev2)
        );
    // return both risk's square root
    return Math.sqrt(stocksRisk + correlatedRisk)
}

export default function DocContent({ expand, stocks }) {
    // lets calcualte the mean varient and standar distribution for each stock
    let [weights, setWeights ] = React.useState(Array(stocks.length).fill(0));
    let [weightsError, setWeightsError ] = React.useState(true);
    let [portafolio, setPortafolio] = React.useState({
        stocks: [{ // example of the structure of the portafolio
            stock: {},
            weight: 0,
            returns: [],
            mean: 0,
            variant: 0,
            standardDeviation: 0,
        }],
        correlations: [{
            stock1: 'AAPL', // example
            stock2: 'COST', // example
            correlation: 0,
        }],
        return: null,
        risk: null
    });
    let [efficientFrontier, setEfficientFrontier ] = React.useState();

    React.useEffect(()=>{
        setWeights(Array(stocks.length).fill(0))
    }, [stocks])

    React.useEffect(() => {
        if(weights.reduce((t,w)=>t+w) > 1) setWeightsError("Cannot be greater than 100%");
        // update the Efficient Frontier, find all posibel combination of weights
        //console.log('weights updated')
        // here we calcualte all the values of the portafolio
        let stockList = stocks.map(stock => {
            // get the frist and last adjusted closing time
            let { timestamp, indicators } = stock.stockChart;
            let { close, open } = indicators.quote[0];
            // get the returns for each close and open for every day
            let returns = timestamp.map((time, i) => ((close[i] - open[i]) / open[i]).toFixed(3));
            // add the meanm variant standard dviation
            return {
                symbol: stock.symbol,
                shortname: stock.shortname,
                weights: null, // null for now
                returns: returns,
                mean: stats.arithmeticMean(returns),
                variant: stats.coefficientOfVariation(returns),
                standardDeviation: stats.standardDeviation(returns),
            }
        })
        //console.log('StockList:', stockList)
        // now let's calculate the correlation between stocks
        // get all the unique combinations of the stocks
        let correlations = uniqueCombinations(stockList)
            .map(([s1, s2]) => ({
                stock1: s1.shortname,
                stock2: s2.shortname,
                symbol1: s1.symbol,
                symbol2: s2.symbol,
                returns1: s1.returns,
                returns2: s2.returns,
                stdDev1: s1.standardDeviation,
                stdDev2: s2.standardDeviation,
                correlation: calcCorrelationCoefficient(s1.returns, s2.returns),
            }));
        //console.log('correlations:', correlations)
        // now let's calcualte the return and risk fo the protafolio
        // get all the unique combinations of the stocks
        //console.log('weights outside', weights);
        // calcualte the portafolio's returns
        let portafolioReturn = calcReturn(
            weights ?? stockList.map(s => s.weight), //weights
            stockList, // the mean returns
        )
        //console.log('portafolio Return', portafolioReturn);
        // calcualte the portafolio's risk
        let risk = calcRisk(
            weights = weights ?? stocks.map(s => s.weight),
            stockList,
            correlations
        )
        //console.log('portafolio risk:', risk);
        // deinfe Effiecy fronteer function
        let calcEF = (stocks, correlations) => weights =>
            [calcReturn(weights, stocks), calcRisk(weights, stocks, correlations)]
        setPortafolio({
            stocks: stockList,
            correlations,
            return: portafolioReturn,
            risk,
        });
        //console.log('portafolio:', portafolio)
        // set efficent fronteer
        let weightCombinations = weight_combinator(weights.length, 50);
        let calcEfficientFrontier = calcEF(stockList, correlations);
        let EF = weightCombinations.map( weights => {
          let [ returns, risk ] = calcEfficientFrontier(weights)
          return { y: returns, x: risk }
        });
        //console.log('efficientFrontier:', EF);
        setEfficientFrontier(EF)
    }, [stocks, weights])

    const createOnChangeWeight = index => event => {
        //console.log('value:', event.target.value)
        let percentage = Number.parseInt(event.target.value);
        //console.log('percetage:', typeof percentage);
        if (typeof percentage !== 'number') {
            setWeightsError("Must be a number")
            setWeights(weights.map((w, i) => i === index ? 0: w)); 
        }else{
            setWeights(weights.map((w, i) => i === index ? (percentage / 100) : w));
        }
    }

    return <>
        <StyledCardContent $expand={expand}>
            <ThemeProvider theme={theme}>
                <Typography variant="h4"> Weights Input </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {portafolio.stocks.map((s, i) =>
                    <TextField
                        sx={{ m: 1, width: '25ch' }}
                        key={i}
                        id="standard-basic"
                        label={s.shortname + "'s Weight"}
                        variant="standard"
                        value={weights[i] * 100}
                        onChange={createOnChangeWeight(i)}
                        type="number"
                    //inputProps={{ 'aria-label': 'weight' }}
                    //InputLabelProps={{ shrink: true, }}
                    InputProps={{
                        startAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                )}
                </Box>
                <Typography variant="h6"> Portafolio risk:</Typography>
                {(portafolio.risk)? <Typography >
                    Portfolio Risk = √ [ {portafolio.stocks.map((s, i) =>
                        `(${s.symbol}'s weight (${weights[i]})^2 * ${s.symbol}'s Standard Deviation (${s.standardDeviation.toFixed(3)})^2) + `
                    )} 
                    {portafolio.correlations.map((c, i) =>
                        `( 2 * (${c.symbol1} and ${c.symbol2}'s corration: ${c.correlation.toFixed(3)}) * (${c.symbol1}'s Standard Deviation (${c.stdDev1.toFixed(3)}) * (${c.symbol2}'s Standard Deviation (${c.stdDev2.toFixed(3)})) ${(i !== portafolio.correlations.length - 1) ? " + " : ""}`
                    )} ] = <b>{portafolio.risk.toFixed(4)}</b> 
                </Typography> : <></> }
                <Typography variant="h6"> Portafolio returns:</Typography>
                {(portafolio.return)? <Typography >
                    Portfolio Returns = { portafolio.stocks.map((stock, i) => 
                    `(${stock.symbol}'s weight: ${weights[i]} * ${stock.symbol}'s mean return: ${stock.mean}) ${(i !== portafolio.stocks.length - 1) ? " + " : ""}`
                    )} = <b>{portafolio.return.toFixed(4)}</b> 
                </Typography>: <></>}
                <CanvasJSChart options={{
                    animationEnabled: true,
                    exportEnabled: true,
                    theme: "dark1", // "light1", "dark1", "dark2"
                    title: {
                        text: "Efficincy Fonteer"
                    },
                    axisY: {
                        title: "returns",
                    },
                    axisX: {
                        title: "Risk",
                        interval: 2
                    },
                    data: [{
                        type: "line",
                        dataPoints: efficientFrontier,
                    }]
                }} />
            </ThemeProvider>
        </StyledCardContent>
    </>
}