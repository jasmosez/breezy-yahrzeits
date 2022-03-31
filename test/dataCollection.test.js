import {monthFilterInvalid, makeDate, getYahr, mapResponses} from '../lib/dataCollection.js'
import {HDate, greg} from '@hebcal/core';
import assert from 'assert'
import sinon from 'sinon'
import {OBSERVATION_SELECTION, GREGORIAN_CAL, HEBREW_CAL, GREGORIAN_DATE_OF_PASSING, SUNSET_SELECTION, BEFORE_SUNSET, AFTER_SUNSET, UNSURE_SUNSET} from '../lib/form_constants.js'


describe('getValidMonthFilter', () => {
    // TO DO 
    it('returns an integer', ()=>{
        assert(true)
    })
})

describe('monthFilterInvalid', () => {

    it('Strings representing numbers between 1 and 12 are valid', ()=>{
        assert.equal(monthFilterInvalid('1'), false)
        assert.equal(monthFilterInvalid('12'), false)
    })
    it('Strings representing numbers less than 1 or more than 12 are invalid', ()=>{
        assert.equal(monthFilterInvalid('0'), true)
        assert.equal(monthFilterInvalid('13'), true)
    })
    it('Strings that cannot be parsed to an integer are invalid', ()=>{
        assert.equal(monthFilterInvalid('hello'), true)
    })
    it('Decimals are invalid', ()=>{
        assert.equal(monthFilterInvalid('1.1'), true)
    })
})


describe('makeDate', () => {
    it('returns Date from "mm/dd/yyyy"', ()=>{
        assert.deepEqual(makeDate('04/19/1982'), new Date('1982', 3, 19))
    })
    it('returns Date from "yyyy-mm-dd"', ()=>{
        assert.deepEqual(makeDate('1982-04-19'), new Date('1982', 3, 19))
    })
})


describe('getYahr during a non-leap year', () => {
    before(() => {
        // Gregorian year 2023 begins in the midst of 5783 (non-leap year)
        const now = new Date(2023, 0, 1)
        sinon.useFakeTimers(now.getTime());
    })
    after(() => {
        sinon.restore()
    })
    it('Returns next occurance of hebrew equivalent of a past gregorian date', async () => {
        // 11th of Nissan (future)
        assert.deepEqual(getYahr(new HDate(11, 1, 5742)), new HDate(11, 1, 5783))
        // // 18th of Adar I (future)
        assert.deepEqual(getYahr(new HDate(18, 12, 5781)), new HDate(18, 12, 5783))
        // // 1st of Tishrei (already happened this herbrew year, but not this gregorian year)
        assert.deepEqual(getYahr(new HDate(1, 7, 5782)), new HDate(1, 7, 5784))
    })
    it('Future dates are treated the same as past dates', async () => {
        // 1st of Tishrei in a future Hebrew year
        assert.deepEqual(getYahr(new HDate(1, 7, 5785)), new HDate(1, 7, 5784))
    })
    it('Today is considered a next occurance', async () => {
        // 8th of Tevet (= Jan 1, 2023)
        assert.deepEqual(getYahr(new HDate(8, 10, 5742)), new HDate(8, 10, 5783))
    })
    it('Adar II dates are no problem. (Observed in Adar)', async () => {
        // 12th of Adar II
        assert.deepEqual(getYahr(new HDate(12, 13, 5779)), new HDate(12, 12, 5783))
    })
})


describe('getYahr during a leap year', () => {
    beforeEach(() => {
        // Gregorian year 2022 begins in the midst of 5782 (a leap year!)
        const now = new Date(2022, 0, 1)
        sinon.useFakeTimers(now.getTime());
    })
    afterEach(() => {
        sinon.restore()
    })
    it('Adar dates return as Adar I', async () => {
        // 18th of Adar
        assert.deepEqual(getYahr(new HDate(18, 12, 5781)), new HDate(18, 12, 5782))
    })
    it('Adar II dates return as Adar II', async () => {
        // 12th of Adar II
        assert.deepEqual(getYahr(new HDate(12, 13, 5779)), new HDate(12, 13, 5782))
    })
})


describe('mapResponses', () => {
    before(() => {
        const now = new Date(2022, 0, 1)
        sinon.useFakeTimers(now.getTime());
    })
    after(() => {
        sinon.restore()
    })
    const calendars = [
        {
            'selection': GREGORIAN_CAL, 
            'sunset': BEFORE_SUNSET,
            'label': "Gregorian calendar (BEFORE Sunset)", 
            'g_date_of_passing': "March 2, 2021",
            'hd_date_of_passing': "18th of Adar, 5781",
            'yahr_in_selected_cal': "March 2, 2022",
            'g_yahr_date': "March 2, 2022",
            'month_number': '3'
        }, 
        {
            'selection': GREGORIAN_CAL, 
            'sunset': AFTER_SUNSET,
            'label': "Gregorian calendar (AFTER Sunset)", 
            'g_date_of_passing': "March 2, 2021",
            'hd_date_of_passing': "19th of Adar, 5781",
            'yahr_in_selected_cal': "March 2, 2022",
            'g_yahr_date': "March 2, 2022",
            'month_number': '3'
        }, 
        {
            'selection': GREGORIAN_CAL, 
            'sunset': UNSURE_SUNSET,
            'label': "Gregorian calendar (UNSURE about Sunset treated as BEFORE Sunset)", 
            'g_date_of_passing': "March 2, 2021",
            'hd_date_of_passing': "18th of Adar, 5781",
            'yahr_in_selected_cal': "March 2, 2022",
            'g_yahr_date': "March 2, 2022",
            'month_number': '3'
        }, 
        {
            'selection': HEBREW_CAL, 
            'sunset': BEFORE_SUNSET,
            'label': "Hebrew calendar (BEFORE Sunset)", 
            'g_date_of_passing': "March 2, 2021",
            'hd_date_of_passing': "18th of Adar, 5781",
            'yahr_in_selected_cal': "18th of Adar, 5781",
            'g_yahr_date': "February 19, 2022",
            'month_number': '2'
        },
        {
            'selection': HEBREW_CAL, 
            'sunset': AFTER_SUNSET,
            'label': "Hebrew calendar (AFTER Sunset)", 
            'g_date_of_passing': "March 2, 2021",
            'hd_date_of_passing': "19th of Adar, 5781",
            'yahr_in_selected_cal': "19th of Adar, 5781",
            'g_yahr_date': "February 20, 2022",
            'month_number': '2'
        },
        {
            'selection': HEBREW_CAL, 
            'sunset': UNSURE_SUNSET,
            'label': "Hebrew calendar (UNSURE about Sunset treated as BEFORE Sunset)", 
            'g_date_of_passing': "March 2, 2021",
            'hd_date_of_passing': "18th of Adar, 5781",
            'yahr_in_selected_cal': "18th of Adar, 5781",
            'g_yahr_date': "February 19, 2022",
            'month_number': '2'
        }
    ]
        
    calendars.forEach(cal => {
        const jsonStr = `[{
            "response": {
                "${OBSERVATION_SELECTION}": {
                    "value": ${cal.selection}
                },
                "${GREGORIAN_DATE_OF_PASSING}": "03/02/2021",
                "${SUNSET_SELECTION}": {
                    "value": ${cal.sunset}
                }
            }
        }]`
        const json = JSON.parse(jsonStr)

        it(`populates values for ${cal.label}`, ()=>{
            const newJson = mapResponses(json)
            assert.equal(newJson[0].response.date_of_passing, cal.date_of_passing)
            assert.equal(newJson[0].response.hd_date_of_passing, cal.hd_date_of_passing)
            assert.equal(newJson[0].response.yahrzeit_date_in_selected_cal, cal.yahrzeit_date_in_selected_cal)
            assert.equal(newJson[0].response.g_yahr_date, cal.g_yahr_date)
            assert.equal(newJson[0].response.month_number, cal.month_number)
        })
    })
})
