import {daysOfWeekInMonth, determineTargetYear, getShabbosTextObjects, makeTextData} from '../lib/weeklyList.js'
import { ENGLISH_NAME_DECEASED, FIRST_NAME_MOURNER, LAST_NAME_MOURNER, PROFILE, RELATIONSHIP } from "../lib/form_constants.js";
import assert from 'assert'
import sinon from 'sinon'


describe('daysOfWeekInMonth', () => {
    const dayOfWeek = 6 
    const m = 10
    const y = 2022
    const dateArray = daysOfWeekInMonth(m, y, dayOfWeek)

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


describe('determineTargetYear', () => {
    const thisMonth = 4
    const prior = thisMonth - 1
    const later = thisMonth + 1
    const thisYear = 2022
    
    before(() => {
        // Gregorian year 2023 begins in the midst of 5783 (non-leap year)
        const now = new Date(thisYear, thisMonth - 1, 19)
        sinon.useFakeTimers(now.getTime());
    })
    after(() => {
        sinon.restore()
    })
    it("if target month is prior to today's month, target month is next year", ()=>{
        assert.equal(determineTargetYear(prior), thisYear + 1)
    })
    it("if target month is today's month, target month is next year", ()=>{
        assert.equal(determineTargetYear(thisMonth), thisYear + 1)
    })
    it("if target month is after to today's month, target month is this year", ()=>{
        assert.equal(determineTargetYear(later), thisYear)
    })
})


describe('getShabbosTextObjects', () => {
    const filteredForms = [
        {response: {
            [PROFILE]: {
                [FIRST_NAME_MOURNER]: "Tess",
                [LAST_NAME_MOURNER]: "Terr"
            },
            [RELATIONSHIP]: "Grandparent",
            [ENGLISH_NAME_DECEASED]: "Zayde Zumba",
            "g_yahr_date": "March 2, 2023"
        }},
        {response: {
            [PROFILE]: {
                [FIRST_NAME_MOURNER]: "Tess",
                [LAST_NAME_MOURNER]: "Terr"
            },
            [RELATIONSHIP]: "Grandparent",
            [ENGLISH_NAME_DECEASED]: "Bubby Smith",
            "g_yahr_date": "March 11, 2023"
        }},
        {response: {
            [PROFILE]: {
                [FIRST_NAME_MOURNER]: "Che",
                [LAST_NAME_MOURNER]: "Kingitout"
            },
            [RELATIONSHIP]: "Cousin",
            [ENGLISH_NAME_DECEASED]: "Cousin Caleb",
            "g_yahr_date": "February 2, 2023"
        }}

    ]
    
    const arr = getShabbosTextObjects(filteredForms)
    it("maps forms to an array of objects", ()=>{
        arr.forEach(el => assert(typeof el === 'object'))
    })
    it("sorts forms by yahrzeit date", ()=>{
        for (let i = 0; i < arr.length - 1; i++) {
            const timeA = new Date(arr[i].yahrzeit).getTime()
            const timeB = new Date(arr[i+1].yahrzeit).getTime()
            assert(timeA <= timeB)
        }
    })
})

describe('makeTextData', () => {
    const filteredForms = [
        {response: {
            [PROFILE]: {
                [FIRST_NAME_MOURNER]: "Tess",
                [LAST_NAME_MOURNER]: "Terr"
            },
            [RELATIONSHIP]: "Grandparent",
            [ENGLISH_NAME_DECEASED]: "Zayde Zumba",
            "g_yahr_date": "March 2, 2023"
        }},
        {response: {
            [PROFILE]: {
                [FIRST_NAME_MOURNER]: "Tess",
                [LAST_NAME_MOURNER]: "Terr"
            },
            [RELATIONSHIP]: "Grandparent",
            [ENGLISH_NAME_DECEASED]: "Bubby Smith",
            "g_yahr_date": "March 11, 2023"
        }},
        {response: {
            [PROFILE]: {
                [FIRST_NAME_MOURNER]: "Che",
                [LAST_NAME_MOURNER]: "Kingitout"
            },
            [RELATIONSHIP]: "Cousin",
            [ENGLISH_NAME_DECEASED]: "Cousin Caleb",
            "g_yahr_date": "February 2, 2023"
        }}

    ]

    const result = makeTextData(3, filteredForms)
    it("produces a text string", ()=>{
        assert(typeof result.outputString === 'string')
    })
    it("includes all the form items in passed to it", ()=>{
        assert(result.success)
    })
})