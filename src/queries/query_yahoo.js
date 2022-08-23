import axios from 'axios';

// other known api, which can handle futute symbol quotes
//axios.get(cors_proxy + `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(stock)}`)

// server address
let cors_proxy = 'https://128.199.9.124:4236/';

// super secret token, don't share =P
let token = '5df54d27-26d0-43ce-aef1-34d71e0b0dbb';

const query_search = async query =>
    axios.get( cors_proxy + `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`, {
        headers: { token } // token for the cors
    }).then(response => {
        //debugger;
        console.log('search option:', response )
        return {
            news: response.data.news,
            quotes: response.data.quotes
        }
    }).catch(error => {
        console.error(error);
    })

const make_quote_summery_query = modules => {
    let module_str = (modules instanceof Array) ? modules.join(",") : modules
    // make add the module tot he request
    return async stock =>
        await axios.get(cors_proxy + `https://query1.finance.yahoo.com/v11/finance/quoteSummary/${encodeURIComponent(stock.symbol)}?modules=${module_str}`, {
            headers: { token }
        }).catch(error => console.error(error))
}

// The assetProfile object contains general information about the company, such as industry, fullTimeEmployees, and website and is useful for getting an overview of the company's assets.
const query_assetProfile = make_quote_summery_query('assetProfile ');

// The defaultKeyStatistics object contains information about a company's stock. This is useful for getting an idea of a company's stock.
const query_defaultKeyStatistics = make_quote_summery_query('defaultKeyStatistics');

// recommendationTrend object contains information about analyst recommendations. This is useful for getting an idea of whether a stock is being bought or sold by analysts.
const query_recommendationTrend = make_quote_summery_query('recommendationTrend');

// The financialData object contains information about a company's financial situation. This is useful for getting an idea of a company's financial situaconst query_tion.
const query_financialData = make_quote_summery_query('financialData')

// The majorHoldersBreakdown object contains information about the top holders of a stock. This is useful for getting an idea of who is buying or selling a stock.
const query_majorHoldersBreakdown = make_quote_summery_query('majorHoldersBreakdown')

// The earnings object contains information about a company's earnings. This is useful for getting an idea of a company's profitability.
const query_earnings = make_quote_summery_query('earnings')

// The earningsHistory object contains information about a company's earnings history. This is useful for getting an idea of a company's past profitability.
const query_earningsHistory = make_quote_summery_query('earningsHistory')

// The earningsTrend object contains information about a company's earnings trend. This is useful for getting an idea of a company's current and future profitability.
const query_earningsTrend = make_quote_summery_query('earningsTrend')

// The indexTrend object contains information about the direction of a stock market index. This is useful for getting an idea of the overall direction of the market.
const query_indexTrend = make_quote_summery_query('indexTrend')

// The industryTrend object contains information about the direction of an industry. This is useful for getting an idea of the overall direction of an industry.
const query_industryTrend = make_quote_summery_query('industryTrend')

// The netSharePurchaseActivity object contains information about the net share purchase activity of a company. This is useful for getting an idea of the overall direction of a company's stock.
const query_netSharePurchaseActivity = make_quote_summery_query('netSharePurchaseActivity')

// sectorTrend object contains information about the direction of a stock market sector. This is useful for getting an idea of the overall direction of a particular stock market sector.
const query_sectorTrend = make_quote_summery_query('sectorTrend')

// The insiderHolders object contains information about the insider holders of a company's stock. This is useful for getting an idea of who owns a company's stock.
const query_insiderHolders = make_quote_summery_query('insiderHolders')

// The upgradeDowngradeHistory object contains information about the upgrades and downgrades that analysts have given a company's stock. This is useful for getting an idea of analyst opinion on a company's stock-
const query_upgradeDowngradeHistory = make_quote_summery_query('upgradeDowngradeHistory')

// get all of them
const query_all_modules = make_quote_summery_query( 
    'assetProfile,defaultKeyStatistics,recommendationTrend,financialData,majorHoldersBreakdown,earnings,earningsHistory,earningsTrend,indexTrend,industryTrend,sectorTrend,insiderHolders,upgradeDowngradeHistory'
)

// get some only the passed modules
const query_multiple_modules = (stock, modules) => make_quote_summery_query(modules)(stock);

const query_stock_chart = async (stock, chart_parameters) => {
    let { interval, // The time interval between two data points. Can be 1m2m5m15m30m60m90m1h1d5d1wk1mo3mo
        range, //The range for which the data is returned. Can be "max" or "previous".
        period1, //  UNIX timestamp representation of the date you wish to start at
        period2, // UNIX timestamp representation of the date you wish to end at
        close, // Adjusts the price type to be returned. valid values are adjusted and unadjusted
        events, // Will include dividends and splits
        includePrePost, // which takes true or false
    } = chart_parameters;
    return await axios.get(cors_proxy + encodeURI(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(stock.symbol)}?` +
        `${interval ? '&interval=' + interval : ''}` +
        `${range ? '&range=' + range : ''}` +
        `${period1 ? '&period1=' + period1 : ''}` +
        `${period2 ? '&period2=' + period2 : ''}` +
        `${close ? '&close=' + close : ''}` +
        `${events ? '&events=' + events : ''}` +
        `${includePrePost ? '&includePrePost=' + includePrePost : ''}`
    )
        , {
            headers: { token }
        }).then(response => {
            return response;
        }).catch(error => {
            console.error(error);
        })
}

const get_history = async (stocks, start, end) =>
    await axios.get(cors_proxy + `https://query1.finance.yahoo.com/v10/finance/quoteSummary/aapl?modules=earningsHistory`, {
        headers: { token }
    }).then(response => {
        return response;
    }).catch(error => {
        console.error(error);
    })

const scrape_financial_data = async stock => {
    return await axios.get(cors_proxy + `https://finance.yahoo.com/quote/${stock.symbol}/financials?p=${stock.symbol}`,
        { headers: { token } }
    ).then(response => { // all the data that er need is just send in a json obj on a script tag. 
        // we can just find it parse parse it.
        let data = JSON.parse(response.data.split("root.App.main = ")[1].split(";\n}(this));")[0]);
        if (data) { // if we got data
            console.log('respose from parse Yahoo data:', data);
            return data.context.dispatcher.stores.QuoteSummaryStore;
        } else
            throw new Error(`Could not scrap financial data for ${stock.symbol}, from url: https://finance.yahoo.com/quote/${stock.symbol}/financials?p=${stock.symbol} `)
        /* this is here as a testimate of the arduous journey i had to undertake to find the data 
            * may this dead code rest in peace *
                let parser = new DOMParser();
                var htmlDoc = parser.parseFromString(response.data, 'text/html')
                // parse html repsose data
                for (let s of htmlDoc.getElementsByTagName('script')) {
                    // find the script which holds the data
                    if (s.textContent.match('.*-- Data --.*')) {
                        let data = JSON.parse(s.textContent.split("root.App.main = ")[1].split(";\n}(this));")[0])
                        // extract get the JSON Data 
                        if (data) { // if we got data
                            console.log('respose from parse Yahoo data:', data);
                            return data.context.dispatcher.stores.QuoteSummaryStore;
                        } else
                            throw new Error(`Could not scrap financial data for ${stock.symbol}, from url: https://finance.yahoo.com/quote/${stock.symbol}/financials?p=${stock.symbol} `)
                    }
                } */
    }).catch(error => {
        console.error(error);
    })
}


export { query_search, 
    // queries
    query_assetProfile, 
    query_defaultKeyStatistics, 
    query_recommendationTrend, 
    query_financialData,
    query_majorHoldersBreakdown,
    query_earnings,
    query_earningsHistory,
    query_earningsTrend,
    query_indexTrend,
    query_industryTrend,
    query_netSharePurchaseActivity,
    query_sectorTrend,
    query_insiderHolders,
    query_upgradeDowngradeHistory,
    query_all_modules,
    query_multiple_modules,
    // chart
    query_stock_chart,
    get_history,
    // scrape function
    scrape_financial_data,
}