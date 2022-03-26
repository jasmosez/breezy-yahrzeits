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

export {daysOfWeekInMonth} 