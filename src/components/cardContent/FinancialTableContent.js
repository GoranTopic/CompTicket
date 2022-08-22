import * as React from 'react';
import CardContent from '@mui/material/CardContent';
import stylize from '../../utils/stylize.js'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { toCapitalizedWords } from '../../utils/formatString.js';

let viewWidth =  '60vw';

const StyledCardContent = stylize(CardContent, ({ theme, $expand }) => ({
    transition: theme.transitions.create(['transform', 'width', 'height'], {
        duration: theme.transitions.duration.standard,
    }),
    // auto does not allow css transitions, bummer.
    // but auto is key so tidoesnot overflow in the phone size
    textAlign: 'center',
    maxWidth: 1200,
    width: $expand ? viewWidth : 300,
    height: $expand ? 'auto' : 150,
}));



export default function TableContent({ expand, stocks }) {

    if(stocks.length >= 4 )  viewWidth = '80vw';
    if(stocks.length === 3 )  viewWidth = '70vw';


    let format = 'fmt';
    let isQuarterly = false;

    stocks.forEach(s => {
        delete s.balanceSheet.maxAge
        delete s.cashFlow.maxAge
        delete s.incomeStatment.maxAge
    })
    // use the frist keys, maybe not the best implementation ever, but hey, it works, ok?
    let incomeStatmentKeys = [];
    let BalanceSheetKeys = [];
    let cashFlowKeys = [];
    stocks.forEach(stock => {
        incomeStatmentKeys = [...incomeStatmentKeys, ...Object.keys(stock.incomeStatment)];
        BalanceSheetKeys = [...BalanceSheetKeys, ...Object.keys(stock.balanceSheet)];
        cashFlowKeys = [...cashFlowKeys, ...Object.keys(stock.cashFlow)];
    })

    return <>
        <StyledCardContent $expand={expand}>
            <Table stickyHeader aria-label="sticky table" >
                <TableHead>
                    <TableRow>
                        <TableCell><b>Balance Sheet Statement</b></TableCell>
                        {stocks.map(s => <TableCell key={s.shortname} align="right"><b>{s.shortname}</b></TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {BalanceSheetKeys.map((rowKey,i) => // for every row key
                        <TableRow key={rowKey+i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                            <TableCell component="th" scope="row"> {toCapitalizedWords(rowKey)} </TableCell>
                            {stocks.map(s => <TableCell key={s.symbol} align="right">
                                {(s.balanceSheet[rowKey])? s.balanceSheet[rowKey][format] : "N/A"}
                            </TableCell>)}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Table stickyHeader aria-label="sticky table" >
                <TableHead>
                    <TableRow>
                        <TableCell><b>CashFlow Statement</b></TableCell>
                        {stocks.map(s => <TableCell key={s.shortname} align="right"><b>{s.shortname}</b></TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {cashFlowKeys.map((rowKey,i) => // for every row key
                        <TableRow key={rowKey+i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                            <TableCell component="th" scope="row"> {toCapitalizedWords(rowKey)} </TableCell>
                            {stocks.map(s => <TableCell key={s.symbol} align="right">
                                {(s.cashFlow[rowKey])? s.cashFlow[rowKey][format] : "N/A"}
                            </TableCell>)}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Table stickyHeader aria-label="sticky table" >
                <TableHead>
                    <TableRow>
                        <TableCell><b>Income Statement</b></TableCell>
                        {stocks.map(s => <TableCell key={s.shortname} align="right"><b>{s.shortname}</b></TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {incomeStatmentKeys.map((rowKey,i) => // for every row key
                        <TableRow key={rowKey+i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                            <TableCell component="th" scope="row"> {toCapitalizedWords(rowKey)} </TableCell>
                            {stocks.map(s => <TableCell key={s.symbol} align="right">
                                {(s.incomeStatment[rowKey])? s.incomeStatment[rowKey][format] : "N/A"}
                            </TableCell>)}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

        </StyledCardContent>
    </>
}