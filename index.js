import {getInput, 
        fetchYahrzeitFormEntries, 
        loadYahrzeitFormEntries, 
        mapResponses, 
        saveToCSV} from './lib/dataCollection.js'
import {determineTargetYear, makeTextData, saveToText} from './lib/weeklyList.js'
import {MONTHS} from './lib/util.js'
import { EMAIL, ENGLISH_NAME_DECEASED, FIRST_NAME_MOURNER, PROFILE, RELATIONSHIP } from './lib/form_constants.js'
import promptInit from "prompt-sync"


const loggingFilteredForms = (filteredForms) => {
    filteredForms.forEach(form => console.log(`
    'email': ${form.response[EMAIL]},
    'first_name': ${form.response[PROFILE][FIRST_NAME_MOURNER]},
    'relationship': ${form.response[RELATIONSHIP]},
    'english_name_deceased': ${form.response[ENGLISH_NAME_DECEASED]},
    'g_date_of_passing': ${form.response.g_date_of_passing},
    'hd_date_of_passing': ${form.response.hd_date_of_passing},
    'yahr_in_selected_cal': ${form.response.yahr_in_selected_cal},
    'g_yahr_date': ${form.response.g_yahr_date},
    'month_number': ${form.response.month_number}
    `))
    console.log(`Number of results = ${filteredForms.length}`)
}

const run = async () => {
    const monthFilter = getInput()
    if (!monthFilter) {
        console.log('Entry is not a number in range. Exiting.')
        process.exit()
    }

    const targetYear = determineTargetYear(monthFilter)
    console.log('Getting yahrzeits occurring in:')
    console.log(`${MONTHS[monthFilter -1].toUpperCase()} ${targetYear}`)
    console.log('')


    const json = await fetchYahrzeitFormEntries()
    // const json = await loadYahrzeitFormEntries()
    // NEED ERROR HANDLING
    
    
    //filtered
    const filteredForms = mapResponses(json).filter(form => form.response.month_number === monthFilter)
    // loggingFilteredForms(filteredForms)

    
    // dump text for shabbat email
    const textDataObj = makeTextData(monthFilter, filteredForms)
    if (!textDataObj.success) {
        throw 'Could not process yahrzeit text for shabbat email'
    }
    const savedTXT = saveToText(textDataObj.outputString)
    
    
    
    // user check in 
    // 1. save everything to a PDF
    const savedCSV = await saveToCSV(filteredForms)
    // 2. prompt user to review and continue with email or not
    const prompt = promptInit()

    console.log('_________________________________________________________________')
    console.log(`CSV of Yahrzeit forms saved to:  ${savedCSV}`)
    console.log(`Text for shabbat email saved to: ${savedTXT}`)
    console.log(``)
    console.log(`Please review both files.`)
    console.log(`If everything looks right, we'll send the emails to the mourners.`)
    const response = prompt(`Type "Send Emails" to confirm: `)
    console.log(``)

    if (response === 'Send Emails') {
        console.log('_________________________________________________________________')
        console.log('Sending Emails...')
        // 3. send emails
    } else {
        console.log('_________________________________________________________________')
        console.log('Not sending emails.')
        console.log('Re-run script or contact support to address an error.')
        console.log('_________________________________________________________________')
        console.log('')
    }




}

run()

