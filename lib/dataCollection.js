import 'dotenv/config'
import fetch from "node-fetch"
import * as fs from 'fs';
import {HDate, greg} from '@hebcal/core';
import pkg from 'json-2-csv';
import {FORM_ID, OBSERVATION_SELECTION, GREGORIAN_CAL, HEBREW_CAL, GREGORIAN_DATE_OF_PASSING, SUNSET_SELECTION, AFTER_SUNSET} from './form_constants.js'
import promptInit from "prompt-sync"
const { json2csv, csv2jsonAsync } = pkg;

const DAY_IN_MS = 24*60*60*1000
// API VALUES
const apiKey = process.env.BREEZE_API
const subdomain = process.env.BREEZE_SUBDOMAIN
const baseURL = `https://${subdomain}.breezechms.com/api/`
const entriesPath = `forms/list_form_entries?form_id=${FORM_ID}&details=1`

// FILE SAVING
const savedCSV = 'forms.csv'

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
 * Creates a Date object from 'mm/dd/yyyy' or 'yyyy-mm-dd'
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
 * find the next gregorian observation date of a hebrew date of passing
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

    // the above abs() call will add a key to nextYahr in the first case of the conditional above. The following code ensures it isn't there for more consistent testing
    const {day, month, year} = nextYahr
    return new HDate(day, month, year)
}

const mapResponses = (json) => {
    return json.map(form => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' }

        // get dateOfPassing
        const dateOfPassing = makeDate(form.response[GREGORIAN_DATE_OF_PASSING])
        form.response.g_date_of_passing = dateOfPassing.toLocaleDateString("en-US", options)
        
        // get hdDateOfPassing
        let hdDateOfPassing
        const sunset = form.response[SUNSET_SELECTION].value.toString()
        if (sunset === AFTER_SUNSET) {
            const dateOfPassingPlusOne = new Date(dateOfPassing.getTime() + DAY_IN_MS)
            hdDateOfPassing = new HDate(dateOfPassingPlusOne)
        } else {
            hdDateOfPassing = new HDate(dateOfPassing);
        }
        form.response.hd_date_of_passing = hdDateOfPassing.render()
        

        //get yahrInSelectedCal and yahr
        let yahr, yahrInSelectedCal

        const selection = form.response[OBSERVATION_SELECTION].value.toString()
        if (selection === GREGORIAN_CAL) {
            const now = new Date()
            const thisGregYear = now.getFullYear()
            const thisGregYearsYahr = new Date(thisGregYear, dateOfPassing.getMonth(), dateOfPassing.getDate())
            yahr = (thisGregYearsYahr > now) ? thisGregYearsYahr : new Date(thisGregYear + 1, dateOfPassing.getMonth(), dateOfPassing.getDate())
            yahrInSelectedCal = yahr.toLocaleDateString("en-US", options)

        } else if (selection === HEBREW_CAL) {
            const hd_yahr = getYahr(hdDateOfPassing)
            yahrInSelectedCal = hd_yahr.render()
            yahr = hd_yahr.greg()
        }

        form.response.yahr_in_selected_cal = yahrInSelectedCal
        form.response.g_yahr_date = yahr.toLocaleDateString("en-US", options)
        form.response.month_number = yahr.getMonth() + 1

        return form
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

const assessMonthFilterValidity = (monthFilter) => {
    monthFilter = parseInt(monthFilter)
    return (!!monthFilter && monthFilter >= 1 && monthFilter <= 12) && monthFilter 
}

const getInput = () => {
    const prompt = promptInit()

    console.log('This script will send emails to anyone observing a yahrzeit (Gregorian or Hebrew) that falls within the Gregorian calendar month of your choosing.')
    console.log('It will also dump a text file of names to be read by Shabbat date.')
    const monthFilter = prompt('Enter Gregorian month by number between 1 and 12 (i.e. 1 = Jan, 2 = Feb, etc.): ')
    return assessMonthFilterValidity(monthFilter)
}


export {getInput, 
        assessMonthFilterValidity,
        makeDate, 
        getYahr, 
        mapResponses, 
        fetchYahrzeitFormEntries, 
        loadYahrzeitFormEntries, 
        saveToCSV
    }
