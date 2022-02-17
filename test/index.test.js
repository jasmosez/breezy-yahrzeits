import {makeDate, getYahr, filterResponses} from '../index.js'
import {HDate, greg} from '@hebcal/core';
import assert from 'assert'
import sinon from 'sinon'
import {OBSERVATION_SELECTION, GREGORIAN_CAL, HEBREW_CAL, GREGORIAN_DATE_OF_PASSING} from '../lib/form_constants.js'




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
        assert.deepEqual(getYahr(new HDate(11, 1, 5742)), new Date(2023, 3, 2))
        // 18th of Adar I (future)
        assert.deepEqual(getYahr(new HDate(18, 12, 5781)), new Date(2023, 2, 11))
        // 1st of Tishrei (already happened this herbrew year, but not this gregorian year)
        assert.deepEqual(getYahr(new HDate(1, 7, 5782)), new Date(2023, 8, 16))
    })
    it('Future dates are treated the same as past dates', async () => {
        // 1st of Tishrei in a future Hebrew year
        assert.deepEqual(getYahr(new HDate(1, 7, 5785)), new Date(2023, 8, 16))
    })
    it('Today is considered a next occurance', async () => {
        // 8th of Tevet (= Jan 1, 2023)
        assert.deepEqual(getYahr(new HDate(8, 10, 5742)), new Date(2023, 0, 1))
    })
    it('Adar II dates are no problem. (Observed in Adar)', async () => {
        // 12th of Adar II
        assert.deepEqual(getYahr(new HDate(12, 13, 5779)), new Date(2023, 2, 5))
    })
})

describe('getYahr during a leap year', () => {
    before(() => {
        // Gregorian year 2022 begins in the midst of 5782 (a leap year!)
        const now = new Date(2022, 0, 1)
        sinon.useFakeTimers(now.getTime());
    })
    after(() => {
        sinon.restore()
    })
    it('Adar dates return as Adar I', async () => {
        // 18th of Adar
        assert.deepEqual(getYahr(new HDate(18, 12, 5781)), new Date(2022, 1, 19))
    })
    it('Adar II dates return as Adar II', async () => {
        // 12th of Adar II
        assert.deepEqual(getYahr(new HDate(12, 13, 5779)), new Date(2022, 2, 15))
    })
})

describe('filterResponses', () => {
    const calendars = [
        {
            'selection': GREGORIAN_CAL, 
            'label': "Gregorian", 
            'yahr': "2022-03-02",
            'verb': 'does not populate',
            'hdDateOfPassing': undefined
        }, 
        {
            'selection': HEBREW_CAL, 
            'label': "Hebrew", 
            'yahr': "2022-02-19",
            'verb': 'populates',
            'hdDateOfPassing': "18th of Adar, 5781"
        }
    ]
        
    calendars.forEach(cal => {
        const jsonStr = `[{
            "response": {
                "${OBSERVATION_SELECTION}": {
                    "value": ${cal.selection}
                },
                "${GREGORIAN_DATE_OF_PASSING}": "03/02/2021"
            }
        }]`
        const json = JSON.parse(jsonStr)
        const newJson = filterResponses(json)

        console.log(json)
        it(`populates response.yahr value for ${cal.label} calendar`, ()=>{
            assert.equal(newJson[0].response.yahr, cal.yahr)
        })
        it(`${cal.verb} response.hdDateOfPassing value for ${cal.label} calendar`, ()=>{
            assert.equal(newJson[0].response.hdDateOfPassing, cal.hdDateOfPassing)
        })
    })
})
