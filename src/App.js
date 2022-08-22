import * as React from 'react';
import './App.css';
import SearchBar from './components/SearchBar.js'
import NoSsr from '@mui/material/NoSsr';
import { ThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/system';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import { lightTheme } from './theme.js'
import { query_multiple_modules, query_stock_chart, scrape_financial_data } from './queries/query_yahoo'
import { unpackfinancialStaments } from './utils/unpacker';
import FinancialStatements from './components/cards/FinancialStaments';
import StockChip from './components/StockChips.js';
import KeyStadistics from './components/cards/KeyStadistics';
import StockChart from './components/cards/StockChart';
import RateOfReturn from './components/cards/RateOfReturn';
import Beta from './components/cards/Beta';
import WACC from './components/cards/WACC';
import WeightedPortafolio from './components/cards/WeightedPortafolio';
import colors from './Colors'


function App() {
  // this is the selected stock
  const [selectedStock, setSelectedStock] = React.useState(null);
  const [stocks, setStocks] = React.useState([]);

  // let's query the modules
  const load_quoteSummery = async stock => {
    /* this function makes a query to the api for the quoteSummery data */
    let response = null;
    let modules = ['assetProfile', 'defaultKeyStatistics', 'financialData'];
    // modules to query
    response = await query_multiple_modules(stock, modules);
    //console.log('Reponse from quoteSummery:', response)
    // if there was a error
    if (response.data.quoteSummary.error)
      throw new Error(response.data.quoteSummary.error)
    return response.data.quoteSummary.result[0];
  }

  // let's the stock chart 
  const load_chart = async stock => {
    /* this function make a query for the todays stock price data */
    let response = null;
    let metrics = 'high';
    let interval = '1mo';
    let range = '20y';
    // modules to query
    response = await query_stock_chart(stock, { metrics, interval, range });
    //console.log('reponse from stockChart:', response)
    // if there was a error
    if (response.data.chart.error)
      throw new Error(response.data.chart.error)
    return response.data.chart.result[0]
  }

  React.useEffect(() => {
    /* quries data fro th stock to the APi */
    // if there is acutal selected
    if (!selectedStock) return;
    // check if it is not already in array
    if (stocks.some(s => s?.symbol === selectedStock?.symbol)) // handle with error code
      return console.error(`Stock: ${selectedStock.symbol} already selected`);
    // start quetirs
    (async () => {
      let data = {};
      await Promise.all([
        // query quote summery
        load_quoteSummery(selectedStock)
          .then(res => data['quoteSummary'] = res),
        // query stock chart
        load_chart(selectedStock)
          .then(res => data['stockChart'] = res),
        // testing scrape balance sheet
        scrape_financial_data(selectedStock)
          .then(res => data = { ...data, ...unpackfinancialStaments(res) }),
      ]);
      // set the data queried
      setStocks([...stocks, { ...selectedStock, ...data, color: colors[stocks.length], active: true }]);
    })()
  }, [selectedStock]);

  return (
    <NoSsr>
      <MuiThemeProvider theme={lightTheme}>
        <ThemeProvider theme={lightTheme}>
          <Box margin={'5%'} justifyContent={'center'} alignItems='center' >
            <SearchBar selectStock={stock => setSelectedStock(stock)} />
            <StockChip stocks={stocks} setStocks={setStocks} />
            <Grid container columns={{ xs: 1, sm: 1, md: 12, lg: 12, xl: 14 }}
              direction="row" justifyContent="space-evenly"
              rowSpacing={5}>
              <KeyStadistics stocks={stocks} />
              <FinancialStatements stocks={stocks} />
              <StockChart stocks={stocks} setStocks={setStocks} />
              <RateOfReturn stocks={stocks} />
              <Beta stocks={stocks} />
              <WACC stocks={stocks} />
              <WeightedPortafolio stocks={stocks} />
            </Grid>
          </Box>
          {stocks.length === 0 ? <div>
            <Box sx={{ marginTop: '20vh', textAlign: 'center' }}>
              <Typography variant="subtitle" paragraph><i>
                This project one day will stop working: Yahoo might change their website, their API might become private or the internet might collapse.
              </i></Typography>
              <Typography variant="subtitle" paragraph><i>
                but today it is working, so enjoy it while it is here...
              </i></Typography>
            </Box>
            <Box sx={{ marginTop: 8, textAlign: 'center' }}>
              <Typography variant="subtitle" paragraph>
                All if data is aquired form Yahoo Finance API and Yahoo Finance Website.
              </Typography>
              <Typography variant="subtitle" paragraph>
                By Goran Topic
              </Typography>
            </Box>
          </div>
            : <></>
          }
        </ThemeProvider>
      </MuiThemeProvider>
    </NoSsr >
  );

}

export default App;