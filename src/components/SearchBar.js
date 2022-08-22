import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { query_search } from '../queries/query_yahoo.js'

export default function AsycnSearchBar({selectStock}) {
  /* this is the companent that handles the queries for stock to the api,
   and options presented */
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [textValue, setTextValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  // would this be loagin if there are no query result?

  React.useEffect(() => {
    let active = true;
    // if(textValue) active = true;
    (async () => {
      if (active && textValue !== "") {
        //console.log("search query:", textValue);
        setLoading(true);
        let response = await query_search(textValue);
        let quotes = response.quotes;
        // filter future quotes
        quotes = quotes.filter(q=> q.quoteType === "EQUITY")
        //console.log("got search suggestions:", quotes);
        setOptions([...quotes]);
        setOpen(true);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [textValue]);

  return <>
    <Autocomplete
      sx={{ maxWidth: 900 }}
      id="Stock Search"
      autoHighlight
      open={open}
      onOpen={() => ((options.length > 0) && setOpen(true))}
      onClose={() => setOpen(false)}
      getOptionLabel={option => (option.symbol + " - " + option.shortname)}
      // selected stock
      onChange={(event, stock) => {
        if (!stock) throw new Error(`Could not find stock for ${stock} `);
        setTextValue('');
        selectStock(stock);
        setOpen(false);
      }}
      // change value of the text search 
      inputValue={textValue}
      onInputChange={event => (event && event?.target?.value !== null) && setTextValue(event.target.value)}
      // this is the list of suggestion
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  </>
}