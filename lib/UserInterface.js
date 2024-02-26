import pkg from 'json-2-csv';
const { json2csvAsync } = pkg;

export class UserInterface {
  constructor() {
    // Initialize any necessary variables or properties
  }

  showMessage(message) {
    // Output the message to the user
    console.log(message);
  }

  collectUserInput(promptMessage) {
    // Collect user input and return it
    const userInput = prompt(promptMessage);
    return userInput;
  }

  validateMonthSelection() {
    if (!this.monthSelection && monthSelection!==0) {
        return false;
    }
    const month = parseFloat(this.monthSelection);
    return Number.isInteger(month) && month >= 0 && month <= 12;
  }
  
  getValidMonthFilter() { 
    this.showMessage(this._welcomeInstructions);
    this.monthSelection = this.collectUserInput(this._monthSelectionPrompt);
    if (this.validateMonthSelection() === false) {
        this.showMessage(this._monthSelectionInvalid);
        process.exit();
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

    fs.writeFileSync(this._txt_filename, data)
    this.pathToText = process.cwd() + '/' + this._txt_filename
  }

  makeTextData = (data) => {
     
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



