import * as React from 'react';
import ParseDataPoint from './ParsedDataPoint.js';
import CardContent from '@mui/material/CardContent';
import stylize from '../../utils/stylize.js'
import { Grid, Stack } from '@mui/material';


const StyledCardContent = stylize(CardContent, ({ theme, $expand }) => ({
  transition: theme.transitions.create(['transform', 'width', 'height'], {
    duration: theme.transitions.duration.standard,
  }),
  // auto does not allow css transitions, bummer.
  // but auto is key so tidoesnot overflow in the phone size
  textAlign: 'center',
  maxWidth: 1200,
  transform: $expand ? 'scale(1)' : 'scale(0.8)',
  width: $expand ? '80vw' : 300,
  height: $expand ? 'auto' : 150, 
}));


export default function ParsedDataContent({ expand, stocks }) {
  let [stockData, setStockData] = React.useState([]);
  let [keys, setKeys] = React.useState([]);

  React.useEffect(() => {
    let data = stocks.map(stock => ({
      color: stock.color,
      data: {
        ...stock.quoteSummary['defaultKeyStatistics'],
        ...stock.quoteSummary['financialData']
      }
    }));
    let keySet = new Set();
    data.forEach(({ data }) =>
      Object.keys(data).forEach(key =>
        keySet.add(key)
      )
    )
    console.log("keySet:", keySet)
    data.forEach(data => delete data.maxAge);
    setStockData([...data]);
    setKeys([...keySet]);
  }, [stocks])


  return <>
    <StyledCardContent $expand={expand}>
      <Grid container direction="row" >
        {keys.map(key =>
          <Grid container item key={key} textAlign={'left'} xs={12} md={expand ? 6 : 12} xl={expand ? 3 : 12}>
            <ParseDataPoint key={key} showLabel={true} label={key} />
            {stockData.filter(stock => stock.data[key])
              .map((stock, i) =>
                <Stack direction="row" spacing={0.7}>
                  <ParseDataPoint key={i} color={stock.color} data={stock.data[key]} />
                </Stack>
              )}
          </Grid>
        )}
      </Grid>
    </StyledCardContent>
  </>
}