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
    // saveToCSV(mapResponses(json))
    const filteredForms = filterResponses(mapResponses(json), monthFilter)
    console.log(`Filter month = ${monthFilter}`)

}

run()

