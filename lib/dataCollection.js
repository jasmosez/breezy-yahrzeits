import 'dotenv/config'
import fetch from "node-fetch"
import * as fs from 'fs';
import {HDate, greg} from '@hebcal/core';
import pkg from 'json-2-csv';
import {FORM_ID, OBSERVATION_SELECTION, GREGORIAN_CAL, HEBREW_CAL, GREGORIAN_DATE_OF_PASSING, SUNSET_SELECTION, AFTER_SUNSET} from './form_constants.js'
import promptInit from "prompt-sync"
const prompt = promptInit()
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

    return nextYahr.greg()
}

const filterResponses = (json) => {
    return json.filter(form => {
        const selection = form.response[OBSERVATION_SELECTION].value.toString()
        const dateOfPassing = makeDate(form.response[GREGORIAN_DATE_OF_PASSING])
        let yahr
        
        if (selection === GREGORIAN_CAL) {
            const now = new Date()
            const thisGregYear = now.getFullYear()
            const thisGregYearsYahr = new Date(thisGregYear, dateOfPassing.getMonth(), dateOfPassing.getDate())
            yahr = (thisGregYearsYahr > now) ? thisGregYearsYahr : new Date(thisGregYear + 1, dateOfPassing.getMonth(), dateOfPassing.getDate())

        } else if (selection === HEBREW_CAL) {
            let hdDateOfPassing
            const sunset = form.response[SUNSET_SELECTION].value.toString()
            if (sunset === AFTER_SUNSET) {
                const dateOfPassingPlusOne = new Date(dateOfPassing.getTime() + DAY_IN_MS)
                hdDateOfPassing = new HDate(dateOfPassingPlusOne)
            } else {
                hdDateOfPassing = new HDate(dateOfPassing);
            }
            form.response.hdDateOfPassing = hdDateOfPassing.render()
            yahr = getYahr(hdDateOfPassing)
        }

        form.response.yahr = yahr.toISOString().slice(0, 10)
        return true
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

const getInput = () => {
    console.log('This script will send emails to anyone observing a yahrzeit (Gregorian or Hebrew) that falls within the Gregorian calendar month of your choosing.')
    console.log('It will also dump a text file of names to be read by Shabbat date.')
    const monthFilter = parseInt(prompt('Enter Gregorian month by number between 1 and 12 (i.e. 1 = Jan, 2 = Feb, etc.): '))
    if (monthFilter < 1 || monthFilter > 12 || !monthFilter) {
        console.log('Entry is not a number in range. Exiting.')
        process.exit()
    }
    return monthFilter
}

export {getInput, makeDate, getYahr, filterResponses, fetchYahrzeitFormEntries, loadYahrzeitFormEntries, saveToCSV}
