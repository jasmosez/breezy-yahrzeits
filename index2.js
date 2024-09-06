import { UserInterface } from './lib/userInterface.js'
import { YahrzeitCollection } from './lib/YahrzeitCollection.js'


const run = async () => {
    const ui = new UserInterface()
    ui.getValidMonthFilter()

    const {
        formsWithProfileIds,
        membersAndDeceased,
        members
    } = await YahrzeitCollection.createYahrzeitCollection(ui);
    
    ui.saveToCSV(formsWithProfileIds)
    if (ui.targetMonth !== 0) {
        ui.saveToText(membersAndDeceased.sort(YahrzeitCollection.sortByYahrzeitAsc))
        ui.sendEmails(members)
    }


    // if monthFilter == 0, end here
    if (ui.targetMonth !== 0 ) {
        // prompt user to review and continue with email or not
        const justMembers = filteredForms.filter(form => form.member_status === MEMBER)
        if (confirmPrompt(savedCSV, savedTXT, justMembers.length)) {
            sendEmails(justMembers)
        }
    }

}

run()

