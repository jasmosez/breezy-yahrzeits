import fs from 'fs';
import pkg from 'json-2-csv';
const { json2csvAsync } = pkg;
import promptInit from "prompt-sync"
import { config } from '../config.js';


const prompt = promptInit();

export class UserInterface {
  constructor() {
    // Initialize any necessary variables or properties
  }

  showMessage(message) {
    // Output the message to the user
    console.log(message);
  }

  collectUserInput(promptMessage = '  > ') {
    // Collect user input and return it
    const userInput = prompt(promptMessage);
    return userInput;
  }

  validateMonthSelection() {
    if (!this.monthSelection && this.monthSelection!==0) {
        return false;
    }
    const month = parseFloat(this.monthSelection);
    return Number.isInteger(month) && month >= 0 && month <= 12;
  }

  determineTargetYear(targetMonth) {
    // if we are in the selected month or earlier, choose the current year; otherwise choose next year
    const today = new Date()
    if (today.getMonth() +1 <= targetMonth) {
      this.targetYear = today.getFullYear()
    } else {
      this.targetYear = today.getFullYear() + 1
    }
    return this.targetYear
  }
  
  getValidMonthFilter() { 
    this.showMessage(this._welcomeInstructions);
    this.showMessage(this._monthSelectionPrompt);
    this.monthSelection = this.collectUserInput();
    if (this.validateMonthSelection() === false) {
        this.showMessage(this._monthSelectionInvalid);
        process.exit();
    } else {
      this.targetMonth = parseInt(this.monthSelection);
      this.targetMonth && this.determineTargetYear(this.targetMonth);
        // print the target month and year
      console.log(`Target month: ${this.targetMonth || 'all months'} ${this.targetYear || ''}`);
    }
  }

  dumpFiles(data) {
    // Save the data to a CSV file
    this.pathToCSV = this.saveToCSV(data);

    // Save the data to a text file, if the month selection is not 0
    if (this.monthSelection !== 0) {
      this.pathToText = this.saveToText(data);
    }
  }

  saveToCSV = async (data) => {
    const csv = await json2csvAsync(data)
    fs.writeFileSync(this._csv_filename, csv)
    this.pathToCSV = process.cwd() + '/' + this._csv_filename
  }
  
  saveToText = (data) => {
    const textDataObj = this.makeTextData(data)
    
    if (!textDataObj.success) {
        throw 'Could not process yahrzeit text for shabbat email'
    }

    fs.writeFileSync(this._txt_filename, textDataObj.outputString)
    this.pathToText = process.cwd() + '/' + this._txt_filename
  }

  makeTextData = (data) => {
    const shabbosTextObjects = this.getShabbosTextObjects(data)
    const dateArray = this.daysOfWeekInMonth(this.targetMonth, this.targetYear)

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

  getShabbosTextObjects = (filteredForms) => {
    const { relationshipField, englishNameDeceasedField } = config.formConstants;
    const objectsArray = filteredForms.map(form => {
        return {
            //0. objects with mourner, realationsip, deceased, yahr date
            mourner: form.profile_first_name + ' ' + form.profile_last_name,
            relationship: form.response[relationshipField],
            deceased: form.response[englishNameDeceasedField],
            yahrzeit: form.next_yahrzeit_gregorian,
        }
    })
    return objectsArray.sort((a, b) => {
        const aTime = new Date(a.yahrzeit).getTime()
        const bTime = new Date(b.yahrzeit).getTime()
        return aTime - bTime
    })
  }

  /**
 * 
 * @param {number} m month integer as its written; not as index number
 * @param {number} y year integer
 * @param {number} targetDayOfWeek daults to Saturday (6)
 * @returns {Array} of Date objects
 */
  daysOfWeekInMonth( m, y, targetDayOfWeek=6 ) {
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




  _welcomeInstructions = `
_________________________________________________________________
BREEZY YAHRZEITS
This script compiles yahrzeits (Gregorian or Hebrew)
that fall within the next or current Gregorian month 
of your choosing.

It will dump two files:
1. CSV of filtered yahrzeit form responses
2. Text file of those yahrzeits by week

Then, it will ask if you want to email the mourners.

`

  _monthSelectionPrompt = `
_________________________________________________________________
Enter Gregorian month by number (i.e. 1 = Jan, 2 = Feb, etc.)
If you enter 0, it will simply download all the form responses.

`

  _monthSelectionInvalid = `Entry is not a number in range. Exiting.`
  _csv_filename = `yahrzeit_forms.csv`
  _txt_filename = `yahrzeit_text_for_shabbat.txt`
}



