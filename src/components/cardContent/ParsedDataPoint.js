import * as React from 'react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { toCapitalizedWords } from '../../utils/formatString.js';

export default function ParseDataPoint({ label, data, showLabel, color }) {
    /* example of object { "numberOfAnalystOpinions": { "raw": 44, "fmt": "44", "longFmt": "44" } } */
    const [show, setShow] = React.useState(false);
    const [isCyclable, setIsCyclable] = React.useState(false);
    const [values, setValues] = React.useState([]);
    const [value, setValue] = React.useState(null);

    React.useEffect(() => { // run once at mount
        // if data is a objec
        try {
            if (data) {
                if (typeof data === "object") {
                    // if this obj has some values
                    if (Object.values(data).length > 0) {
                        //console.log('values:', Object.values(data));
                        setValues(Object.values(data));
                        setShow(true)
                        // find preferable format
                        if (data['fmt']) setValue(data['fmt']);
                        else if (data['longFmt']) setValue(data['longFmt']);
                        else setValue(Object.values(data)[0]);
                        // get unique values
                        // has more than one value?
                        let uniques = new Set(Object.values(data).map(v => v?.toString()));
                        //console.log('uniques:', uniques)
                        if (uniques.size > 1) //of we have more than one unique element 
                            setIsCyclable(true);
                    }
                    //if data is a string
                } else if (typeof data === "string") {
                    setShow(true) // set ot show
                    setValue(data); // se the string as the data
                    setIsCyclable(false); // data is not ccyclable
                } else { // niether a strign nor a obj
                    throw new Error("Passed Data mus be  string or obj")
                }
            }
        } catch (e) {
            console.error(e)
            //console.log('data:', typeof data);
            //console.log('data:', data);
        }
    }, []);

    const cycleValues = () => {
        let index = values.indexOf(value);
        if (index === values.length - 1) index = 0;
        else index++;
        setValue(values[index]);
    }

    return <>
        {showLabel ?
            <Typography variant="body1" paragraph> {toCapitalizedWords(label) + ":"} </Typography> :
            value ?
                isCyclable ?
                    <Chip label={value} variant="outlined" sx={{ backgroundColor: color.topColor }} onClick={cycleValues} /> :
                    <Chip label={value} sx={{ backgroundColor: color.topColor }} />
                : <Chip label={"N/A"} sx={{ backgroundColor: color.bottomColor }} />
        }
    </>
}
