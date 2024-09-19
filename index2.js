import { UserInterface } from './lib/UserInterface.js'
import { YahrzeitCollection } from './lib/YahrzeitCollection.js'


const run = async () => {
    const ui = new UserInterface()
    ui.getValidMonthFilter()

    const {
        formsWithProfileIds,
        membersAndDeceased,
        members
    } = await YahrzeitCollection.createYahrzeitCollection(ui);
    
    await ui.saveToCSV(formsWithProfileIds)
    if (ui.targetMonth !== 0) {
        ui.saveToText(membersAndDeceased.sort(YahrzeitCollection.sortByYahrzeitAsc))
        await ui.sendEmails(members)
    }

    ui.showMessage(ui._goodbye)

}

run()

