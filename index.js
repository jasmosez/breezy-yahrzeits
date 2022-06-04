import { mapFilterMap, getValidMonthFilter, fetchYahrzeitFormEntries, saveToCSV} from './lib/dataCollection.js'
import {saveToText} from './lib/weeklyList.js'
import {sendEmails} from './lib/mail.js'
import promptInit from "prompt-sync"

const confirmPrompt = (savedCSV, savedTXT) => {
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
        return true
    } else {
        console.log('_________________________________________________________________')
        console.log('Not sending emails.')
        console.log('Re-run script or contact support to address an error.')
        console.log('_________________________________________________________________')
        console.log('')
    }

}

const run = async () => {
    const monthFilter = getValidMonthFilter()
 
    // Get and filter forms
    const json = await fetchYahrzeitFormEntries() // NEED ERROR HANDLING
    const filteredForms = await mapFilterMap(monthFilter, json)

    // dump to csv
    const savedCSV = await saveToCSV(filteredForms)

    // if monthFilter == 0, end here
    if (!!monthFilter) {
        // dump text for shabbat email
        const savedTXT = saveToText(monthFilter, filteredForms)
        
        // prompt user to review and continue with email or not
        if (confirmPrompt(savedCSV, savedTXT)) {
            sendEmails(filteredForms)
        }
    }

}

run()

