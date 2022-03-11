import {getInput, 
        fetchYahrzeitFormEntries, 
        loadYahrzeitFormEntries, 
        mapResponses, 
        saveToCSV} from './lib/dataCollection.js'

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
    console.log(`Number of results = ${filteredForms.length}`)

}

run()

