import fs from 'fs'
import { ENGLISH_NAME_DECEASED, FIRST_NAME_MOURNER, LAST_NAME_MOURNER, PROFILE, RELATIONSHIP } from "./form_constants.js";

// FILE SAVING
const savedTXT = 'shabbat_text.txt'

/**
 * 
 * @param {number} m month integer as its written; not as index number
 * @param {number} y year integer
 * @param {number} targetDayOfWeek daults to Saturday (6)
 * @returns {Array} of Date objects
 */
function daysOfWeekInMonth( m, y, targetDayOfWeek=6 ) {
    var daysInMonth = new Date( y,m,0 ).getDate();
    var firstDayOfWeek = new Date( m +'/01/'+ y ).getDay()
    let firstTargetDate

    if (firstDayOfWeek === targetDayOfWeek) {
        firstTargetDate = 1
    } else {
        const diff = Math.abs(targetDayOfWeek - firstDayOfWeek)
        if (firstDayOfWeek < targetDayOfWeek) {
            firstTargetDate = diff + 1
        } else  {
            firstTargetDate = 8 - diff
        }
    }

    const sevenDays = 7 * 24 * 60 * 60 * 1000
    let aDate = new Date(y, m - 1, firstTargetDate) 
    const dateArray = [aDate]    
    while (aDate.getMonth() + 1 === m) {
        aDate = new Date(aDate.getTime() + sevenDays) 
        dateArray.push(aDate)
    }

    return dateArray
}

/**
 * 
 * @param {*} filteredForms a collectiom
 */
const getShabbosTextObjects = (filteredForms) => {
    const objectsArray = filteredForms.map(form => {
        return {
            //0. objects with mourner, realationsip, deceased, yahr date
            mourner: form.response[PROFILE][FIRST_NAME_MOURNER] + ' ' + form.response[PROFILE][LAST_NAME_MOURNER],
            relationship: form.response[RELATIONSHIP],
            deceased: form.response[ENGLISH_NAME_DECEASED],
            yahrzeit: form.response.g_yahr_date
        }
    })
    return objectsArray.sort((a, b) => {
        const aTime = new Date(a.yahrzeit).getTime()
        const bTime = new Date(b.yahrzeit).getTime()
        return aTime - bTime
    })
}

const determineTargetYear = (monthFilter) => {
    const d = new Date()
    let targetYear 
    if (d.getMonth() +1 < monthFilter) {
        targetYear = d.getFullYear()
    } else {
        targetYear = d.getFullYear() + 1
    }

    return targetYear
}

const makeTextData = (monthFilter, filteredForms) => {
    const shabbosTextObjects = getShabbosTextObjects(filteredForms)
    const targetYear = determineTargetYear(monthFilter)
    const dateArray = daysOfWeekInMonth(monthFilter, targetYear)


    let outputString = ''
    const dateFormat = { year: 'numeric', month: 'long', day: 'numeric' }
    let i = 0

    dateArray.forEach(date => {
        outputString = outputString + date.toLocaleString('en-US', dateFormat) + `\n`
        while (i < shabbosTextObjects.length && date.getTime() >= new Date(shabbosTextObjects[i].yahrzeit).getTime()) {
            const { mourner, relationship, deceased, yahrzeit } = shabbosTextObjects[i]
            //2. <Mourner>, <relationship> of <deceased> (<greg yahrzeit date>)
            let newYahrLine = `${deceased}, ${relationship} of ${mourner} (${yahrzeit})\n`
            outputString = outputString + newYahrLine
            i++
        }
        outputString = outputString + `\n`

    })

    return {outputString, success: i === shabbosTextObjects.length}
}

const saveToText = (data) => {
    fs.writeFileSync(savedTXT, data)
    // console.log('The shabbat text file has been saved!')
    return process.cwd() + '/' + savedTXT
}


export {
    daysOfWeekInMonth,
    determineTargetYear,
    getShabbosTextObjects,
    makeTextData,
    saveToText
} 