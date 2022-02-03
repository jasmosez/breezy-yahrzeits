import fetch from "node-fetch"
import pkg from 'json-2-csv';
const { json2csv, csv2jsonAsync } = pkg;
import * as fs from 'fs';
import {HDate, greg} from '@hebcal/core';
import { diffString, diff } from 'json-diff';

const apiKey = '0c9b2cb96e3593dbe9dcb74b029f8b03'
const formID = '323268'
const baseURL = 'https://koltzedek.breezechms.com/api/'
const entriesPath = `forms/list_form_entries?form_id=${formID}&details=1`

// January == 0
const queryMonth = 2 //March
const queryYear = 2022
const hdQueryMonthStart = new HDate(new Date(queryYear, queryMonth, 1));
const hdQueryMonthEnd = new HDate(new Date(queryYear, queryMonth, greg.daysInMonth(queryMonth+1, queryYear)));

// CONSTANTS
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

const makeDate = (dateStr) => {
    const dateArr = dateStr.split('/')
    const month = parseInt(dateArr[0]) - 1
    const day = parseInt(dateArr[1])
    const year = parseInt(dateArr[2])
    return new Date(year, month, day)
}

const getYahr = (hdDateOfPassing) => {
    let hdYahrDate
    // if query month start and end are in same hebrew calendar year, 
    // then make a new hebrew date in that year with the date and month of passing
    if (hdQueryMonthStart.getFullYear() === hdQueryMonthEnd.getFullYear()) {
        // REMOVE
        // guaranteed to be 5782
        hdYahrDate = new HDate(hdDateOfPassing.getDate(), hdDateOfPassing.getMonth(), hdQueryMonthStart.getFullYear())
    } else {
        // otherwise, the query month spans elul / tishrei 
        // if the date of passing is prior to rosh hashana, use the year of the query month start
        // if the date of passing is in tishri or later, use the year of the query month end
        const observationYear = hdDateOfPassing.getMonth() < 7 ? hdQueryMonthStart.getFullYear() : hdQueryMonthEnd.getFullYear()
        hdYahrDate = new HDate(hdDateOfPassing.getDate(), hdDateOfPassing.getMonth(), observationYear)
    }
    return hdYahrDate.greg()
}

const filterResponses = (json) => {
    return json.filter(form => {
        const selection = form.response[OBSERVATION_SELECTION].value.toString()
        const dateOfPassing = makeDate(form.response[GREGORIAN_DATE_OF_PASSING])
        let yahr
        
        if (selection === GREGORIAN_CAL) {
            // REMOVE
            // guaranteed to be 2022
            yahr = new Date(queryYear, dateOfPassing.getMonth(), dateOfPassing.getDate())
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

const saveToCSV = (json) => {
    json2csv(json, (err, csv) => {
        fs.writeFile('forms.csv', csv, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          })
    })

}

const run = async () => {

    // const json = await fetchYahrzeitFormEntries()
    const json = await loadYahrzeitFormEntries()
    saveToCSV(filterResponses(json))

}


run()
/*
GOAL: I write in a month and year
I get all the yahrzeits to be observed in that period
They are organized by gregorian date of observation
Each on identified whether it is observing the gregorian or hebrew date
if hebrew date, it indicates what that date is
*/
