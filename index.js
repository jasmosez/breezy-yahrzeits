import 'dotenv/config'
import fetch from "node-fetch"
import * as fs from 'fs';
import {HDate, greg} from '@hebcal/core';
import pkg from 'json-2-csv';
const { json2csv, csv2jsonAsync } = pkg;

// API VALUES
const apiKey = process.env.BREEZE_API
const formID = process.env.FORM_ID
const baseURL = 'https://koltzedek.breezechms.com/api/'
const entriesPath = `forms/list_form_entries?form_id=${formID}&details=1`

// TEMPORARY CONSTANTS: TO BE USER INPUTTED
// January == 0
const queryMonth = 2 //March
const queryYear = 2022
const hdQueryMonthStart = new HDate(new Date(queryYear, queryMonth, 1));
const hdQueryMonthEnd = new HDate(new Date(queryYear, queryMonth, greg.daysInMonth(queryMonth+1, queryYear)));

// FILE SAVING
const savedCSV = 'forms2.csv'

// FORM CONSTANTS
const OBSERVATION_SELECTION = '2092220853'
const GREGORIAN_CAL = '403'
const HEBREW_CAL = '404'
const GREGORIAN_DATE_OF_PASSING = '2092220844'

const fetchYahrzeitFormEntries = async () => {
    const configObj = {
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
          },
      
    }
    const resp = await fetch(baseURL + entriesPath, configObj)
    return resp.json()
}

const loadYahrzeitFormEntries = async () => {
    const data = fs.readFileSync('./source_forms.csv', 'utf8')
    return csv2jsonAsync(data)
}

/**
 * Creates a Date object from 'mm/dd/yyyy' string
 * @param {string} dateStr 
 * @returns {Date} 
 */
const makeDate = (dateStr) => {
    let dateArr
    let month
    let day
    let year

    if (dateStr.search('/') > 0) {
        dateArr = dateStr.split('/')
        month = parseInt(dateArr[0]) - 1
        day = parseInt(dateArr[1])
        year = parseInt(dateArr[2])
    } else {
        dateArr = dateStr.split('-')
        month = parseInt(dateArr[1]) - 1
        day = parseInt(dateArr[2])
        year = parseInt(dateArr[0])
    }

    return new Date(year, month, day)
}


/**
 * find the next yahrzeit observation date
 * @param {HDate} hdDateOfPassing 
 * @returns {Date}
 */
const getYahr = (hdDateOfPassing) => {
    let nextYahr
    const today = new HDate()
    const thisYearYahr = new HDate(
        hdDateOfPassing.getDate(),
        hdDateOfPassing.getMonth(),
        today.getFullYear()
    )

    if (thisYearYahr.abs() >= today.abs()) {
        nextYahr = thisYearYahr
    } else {
        nextYahr = new HDate(
            hdDateOfPassing.getDate(),
            hdDateOfPassing.getMonth(),
            today.getFullYear() + 1
        )
    }

    return nextYahr.greg()
}

const filterResponses = (json) => {
    return json.filter(form => {
        const selection = form.response[OBSERVATION_SELECTION].value.toString()
        const dateOfPassing = makeDate(form.response[GREGORIAN_DATE_OF_PASSING])
        let yahr
        
        if (selection === GREGORIAN_CAL) {
            // REMOVE
            // guaranteed to be 2022
            const now = new Date()
            const thisGregYear = now.getFullYear()
            const thisGregYearsYahr = new Date(thisGregYear, dateOfPassing.getMonth(), dateOfPassing.getDate())
            yahr = (thisGregYearsYahr > now) ? thisGregYearsYahr : new Date(thisGregYear + 1, dateOfPassing.getMonth(), dateOfPassing.getDate())

        } else if (selection === HEBREW_CAL) {
            const hdDateOfPassing = new HDate(dateOfPassing);
            form.response.hdDateOfPassing = hdDateOfPassing.render()
            yahr = getYahr(hdDateOfPassing)
        }

        form.response.yahr = yahr.toISOString().slice(0, 10)
        return true
        // if (yahr.getMonth() === queryMonth) {
        // }
    })

}

/**
 * Save JSON data to a csv
 * @param {json} json 
 */
const saveToCSV = (json) => {
    json2csv(json, (err, csv) => {
        fs.writeFile(savedCSV, csv, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          })
    })

}

const run = async () => {
    console.log(await getYahr(new Date(2021, 2, 2)))
    // const json = await fetchYahrzeitFormEntries()
    // const json = await loadYahrzeitFormEntries()
    // saveToCSV(filterResponses(json))

}


run()


export {makeDate, getYahr, filterResponses}
/*
GOAL: I write in a month and year
I get all the yahrzeits to be observed in that period
They are organized by gregorian date of observation
Each on identified whether it is observing the gregorian or hebrew date
if hebrew date, it indicates what that date is
*/
