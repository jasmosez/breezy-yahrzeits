import {getInput, 
        fetchYahrzeitFormEntries, 
        loadYahrzeitFormEntries, 
        mapResponses, 
        saveToCSV} from './lib/dataCollection.js'
import { EMAIL, ENGLISH_NAME_DECEASED, FIRST_NAME_MOURNER, PROFILE, RELATIONSHIP } from './lib/form_constants.js'

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
    const json = await fetchYahrzeitFormEntries()
    // const json = await loadYahrzeitFormEntries()
    saveToCSV(mapResponses(json))
    const filteredForms = mapResponses(json).filter(form => form.response.month_number === monthFilter)
    
    //optional
    loggingFilteredForms(filteredForms)



}

run()

