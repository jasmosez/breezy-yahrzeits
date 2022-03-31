import 'dotenv/config'
import fetch from "node-fetch"
import * as fs from 'fs';
import {HDate} from '@hebcal/core';
import promptInit from "prompt-sync"
import pkg from 'json-2-csv';
const { json2csvAsync, csv2jsonAsync } = pkg;

import {determineTargetYear} from './weeklyList.js'
import {FORM_ID, OBSERVATION_SELECTION, GREGORIAN_CAL, HEBREW_CAL, GREGORIAN_DATE_OF_PASSING, SUNSET_SELECTION, AFTER_SUNSET, EMAIL, ENGLISH_NAME_DECEASED, FIRST_NAME_MOURNER, PROFILE, RELATIONSHIP} from './form_constants.js'
import {DAY_IN_MS, MONTHS} from './util.js'
import {textBody, htmlBody} from './email_template.js'


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
 * @returns {string} path of saved file
 */
const saveToCSV = async (json) => {
    const csv = await json2csvAsync(json)
    fs.writeFileSync(savedCSV, csv)
    // console.log('The csv file has been saved!');
    return process.cwd() + '/' + savedCSV
}


const logFilteredForms = (filteredForms) => {
    filteredForms.forEach(form => console.log(`
        'email': ${form.response[EMAIL]},
        'first_name': ${form.response[PROFILE][FIRST_NAME_MOURNER]},
        'relationship': ${form.response[RELATIONSHIP]},
        'english_name_deceased': ${form.response[ENGLISH_NAME_DECEASED]},
        'yahr_in_selected_cal': ${form.response.yahr_in_selected_cal},
        'g_date_of_passing': ${form.response.g_date_of_passing},
        'hd_date_of_passing': ${form.response.hd_date_of_passing},
        'g_yahr_date': ${form.response.g_yahr_date},
        'month_number': ${form.response.month_number}
    `))
    console.log(`Number of results = ${filteredForms.length}`)
}


const logTargetMonth = (monthFilter) => {
    const targetYear = determineTargetYear(monthFilter)
    console.log('Getting yahrzeits occurring in:')
    console.log(`${MONTHS[monthFilter -1].toUpperCase()} ${targetYear}`)
    console.log('')
}


const monthFilterInvalid = (monthFilter) => {
    monthFilter = parseFloat(monthFilter)
    return !monthFilter || monthFilter < 1 || monthFilter > 12 || !Number.isInteger(monthFilter)
}


const getValidMonthFilter = () => {
    const prompt = promptInit()

    console.log('_________________________________________________________________')
    console.log('BREEZY YAHRZEITS')
    console.log('')
    console.log('_________________________________________________________________')
    console.log('This script compiles yahrzeits (Gregorian or Hebrew)')
    console.log('that fall within the Gregorian month of your choosing.')
    console.log('It will dump two files:')
    console.log('  1. CSV of filtered yahrzeit form responses')
    console.log('  2. Text file of those yahrzeits by week')
    console.log('Then, it will ask if you want to email the mourners')
    console.log('')
    console.log('_________________________________________________________________')
    const monthFilter = prompt('Enter Gregorian month by number (i.e. 1 = Jan, 2 = Feb, etc.): ')

    if (monthFilterInvalid(monthFilter)) {
        console.log('Entry is not a number in range. Exiting.')
        process.exit()
    }

    logTargetMonth(monthFilter)
    return parseInt(monthFilter)
}

export {
        getValidMonthFilter, 
        monthFilterInvalid,
        makeDate, 
        getYahr, 
        logFilteredForms,
        mapResponses, 
        fetchYahrzeitFormEntries, 
        loadYahrzeitFormEntries, 
        saveToCSV
    }
