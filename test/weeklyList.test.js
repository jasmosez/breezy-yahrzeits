import {daysOfWeekInMonth} from '../lib/weeklyList.js'
import assert from 'assert'

describe('daysOfWeekInMonth', () => {
    const dayOfWeek = 6 
    const m = 10
    const y = 2022
    const dateArray = daysOfWeekInMonth(m, y, dayOfWeek)
    console.log(dateArray)
    it('returns an array of dates', ()=>{
        dateArray.forEach(d => assert(d instanceof Date))
    })
    it('all dates are the right day of the week', ()=>{
        dateArray.forEach(d => assert(d.getDay() === dayOfWeek))
    })
    it('the last date is in the next month', ()=>{
        assert.equal(dateArray[dateArray.length -1].getMonth() + 1, m+1)
    })
    it('the penultimate date is in the month', ()=>{
        assert.equal(dateArray[dateArray.length -2].getMonth() + 1, m)

    })
})