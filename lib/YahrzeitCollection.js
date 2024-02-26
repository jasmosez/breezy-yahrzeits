import { HDate, HebrewCalendar } from '@hebcal/core';
import { config } from '../config.js';
import fetch from "node-fetch"
import { DAY_IN_MS } from './util.js';

export class YahrzeitCollection {
    profilesPath = `people/`

    // private variables
    #baseURL = `https://${config.breeze.subdomain}.breezechms.com/api/`
    #entriesPath = `forms/list_form_entries?form_id=${config.breeze.formId}&details=1`
    #configObj = {
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': config.breeze.apiKey,
        },
    }
    
    constructor() {}

    async init () {
        const url = this.#baseURL + this.#entriesPath
        try {
            const resp = await fetch(url, this.#configObj)
            this.data = resp.json()
        }
        catch (error) {
            console.error(_yahrzeitFetchError, error)
            process.exit()
        }
    }

    dateFromStr(dateStr) {
        // Creates a Date object from 'mm/dd/yyyy' or 'yyyy-mm-dd'
        let month
        let day
        let year

        if (dateStr.search('/') > 0) {
            const dateArr = dateStr.split('/')
            month = parseInt(dateArr[0]) - 1
            day = parseInt(dateArr[1])
            year = parseInt(dateArr[2])
        } else {
            const dateArr = dateStr.split('-')
            month = parseInt(dateArr[1]) - 1
            day = parseInt(dateArr[2])
            year = parseInt(dateArr[0])
        }

        return new Date(year, month, day)
    }

    getNextYahrzeitHebrewDate(hebrewDateOfPassing) {
        let nextYahrzeitHebrewDate
        const now = new HDate()
        const yahrzeitInCurrentHebrewYear = HebrewCalendar.getYahrzeit(now.getFullYear(), hebrewDateOfPassing)

        if (!yahrzeitInCurrentHebrewYear) {
            // if there is no yahrzeit in the current calendar it is either because they passed in the current year or that the date of passing is invalid
            if (hebrewDateOfPassing.getFullYear() === now.getFullYear()) {
                nextYahrzeitHebrewDate = HebrewCalendar.getYahrzeit(now.getFullYear() + 1, hebrewDateOfPassing)
            } else {
                throw new RangeError(`Invalid Hewbrew date of passing: ${hebrewDateOfPassing.render()}`)
            }
            
        // if today is the yahrzeit, we consider it the next occurrance
        } else if (yahrzeitInCurrentHebrewYear.abs() >= now.abs()) {
            nextYahrzeitHebrewDate = yahrzeitInCurrentHebrewYear
        } else {
            nextYahrzeitHebrewDate = HebrewCalendar.getYahrzeit(now.getFullYear() + 1, hebrewDateOfPassing)
        }

        // the above abs() call will add a key to nextYahr in the first case of the conditional above. The following code ensures it isn't there for more consistent testing
        const {day, month, year} = nextYahrzeitHebrewDate
        return new HDate(day, month, year)
    }

    addCalculatedData() {
        const localeOptions = { year: 'numeric', month: 'long', day: 'numeric' }
        let errorCount = 0
        const { 
            gregorianDateOfPassingField,
            sunsetField,
            afterSunsetOption,
            beforeSunsetOption,
            unsureSunsetOption,
            observanceField,
            gregorianCalendarOption,
            hebrewCalendarOption,

        } = config.formConstants
        const _after_sunset = ' after sunset'
        const _before_sunset = ' before sunset'
        const _unsure_sunset = ' at an unknown time'

        this.processedData = this.data.map(form => {
            try {
                // get gregorian date of passing (Date)
                const dateOfPassing = this.dateFromStr(form.response[gregorianDateOfPassingField])
                const now = new Date()
                if (dateOfPassing > now) {
                    throw new RangeError(`Date of passing is in the future: ${dateOfPassing.toLocaleDateString('en-US', localeOptions)}`)
                }

                // get sunset preposition and hebrew date of passing (HDate)
                let sunset_preposition, hebrewDateOfPassing
                const sunset = form.response[sunsetField].value.toString()
                if (sunset === afterSunsetOption) {
                    sunset_preposition = _after_sunset
                    hebrewDateOfPassing = new HDate(new Date(dateOfPassing.getTime() + DAY_IN_MS))
                } else if (sunset === beforeSunsetOption) {
                    sunset_preposition = _before_sunset
                    hebrewDateOfPassing = new HDate(dateOfPassing)  
                } else if (sunset === unsureSunsetOption) {
                    sunset_preposition = _unsure_sunset
                    hebrewDateOfPassing = new HDate(dateOfPassing)
                } else {
                    throw new RangeError(`Invalid sunset selection: ${sunset}`)
                }

                // get calendar, next yarzeit Gregorian date (Date), and next yarzeit observed in selected calendar (string)
                let calendar, nextYahrzeitGregorianDate, nextYahrzeitInSelectedCalendarStr
                const observance = form.response[observanceField].value.toString()
                if (observance === gregorianCalendarOption) {
                    calendar = 'Gregorian'
                    const currentGregorianYear = now.getFullYear()
                    const yahrzeitInCurrentGregorianYear = new Date(currentGregorianYear, dateOfPassing.getMonth(), dateOfPassing.getDate())

                    // if today is the yahrzeit, we return next year's date
                    if (yahrzeitInCurrentGregorianYear < now) {
                        nextYahrzeitGregorianDate = new Date(currentGregorianYear + 1, dateOfPassing.getMonth(), dateOfPassing.getDate())
                    } else {
                        nextYahrzeitGregorianDate = yahrzeitInCurrentGregorianYear
                    }

                    nextYahrzeitInSelectedCalendarStr = nextYahrzeitGregorianDate.toLocaleDateString('en-US', localeOptions)
                
                } else if (observance === hebrewCalendarOption) {
                    calendar = 'Hebrew'
                    const nextYahrzeitHebrewDate = this.getNextYahrzeitHebrewDate(hebrewDateOfPassing)
                    nextYahrzeitGregorianDate = nextYahrzeitHebrewDate.greg()
                    nextYahrzeitInSelectedCalendarStr = nextYahrzeitHebrewDate.render()
                } else {
                    throw new RangeError(`Invalid observance selection: ${observance}`)
                }

                // add calculated data to form (6 data points)
                form.greg_date_of_passing = dateOfPassing.toLocaleDateString('en-US', localeOptions)
                form.sunset_preposition = sunset_preposition
                form.hebrew_date_of_passing = hebrewDateOfPassing.render()
                form.calendar = calendar
                form.next_yahrzeit_observed = nextYahrzeitInSelectedCalendarStr
                form.next_yahrzeit_gregorian = nextYahrzeitGregorianDate.toLocaleDateString('en-US', localeOptions)

                // add month and year for filtering
                form.month_number = nextYahrzeitGregorianDate.getMonth() + 1
                form.year = nextYahrzeitGregorianDate.getFullYear()

                return form

            } catch (error) {
                errorCount++
                console.error(`
                Error processing form: ${error.name} - ${error.message}
                Form skipped: ${form}

                `)
                return {response: {month_number: undefined, year: undefined}}
            }
        })

        console.log(`
        _________________________________________________________________
        Number of forms skipped: ${errorCount}

        `)
    }

    determineTargetYear(monthFilter) {
        // if we are in the selected month or earlier, choose the current year; otherwise choose next year
        const today = new Date()
        if (today.getMonth() +1 <= monthFilter) {
            return today.getFullYear()
        } else {
            return today.getFullYear() + 1
        }
    }

    applyMonthFilter(monthFilter) {
        if (monthFilter === 0) {
            this.filteredProcessedData = this.processedData
        } else {
            const targetYear = this.determineTargetYear(monthFilter)
            this.filteredProcessedData = this.processedData.filter(form => {
                return form.response.month_number === monthFilter && form.response.year === targetYear
            })
        }
    }

    async addProfileStatusData() {
        const { personIdField,
            firstNameMournerField,
            lastNameMournerField,
            profileStatusField,
            profileEmailListField,
            isPrimaryField,
            allowBulkField} = config.formConstants
        const url = this.#baseURL + this.profilesPath + form[personIdField]
        const filteredProcessedDataWithProfileIds = this.filteredProcessedData.filter(form => !!form.person_id)
        
        this.formsWithProfileIds = await Promise.all(filteredProcessedDataWithProfileIds.map(async form => {
            try {
                // fetch profile info
                const resp = await fetch (url, this.#configObj)
                const profile = await resp.json()
    
                // get profile email
                let profile_email
                const email = profile[profileEmailListField].find(el => el[isPrimaryField] === '1' && el[allowBulkField] === '1')
                if (!email?.address) {
                    console.error(`Missing profile email. id: ${profile.id}, last name: ${profile[lastNameMournerField]}`)
                    profile_email = ''
                } else {
                    profile_email = email.address
                }
                
                // add profile data to form
                form.profile_first_name = profile[firstNameMournerField]
                form.profile_last_name = profile[lastNameMournerField]
                form.member_status = profile.details[profileStatusField].name
                form.profile_email = profile_email
                
                return form
            } catch(err){
                console.log(`Failed to get profile info for id ${form[personIdField]}`, err)
            }
        }))

        this.membersAndDeceased = this.formsWithProfileIds.filter(form => form.member_status === 'Member' || form.member_status === 'Deceased')
        this.members = this.formsWithProfileIds.filter(form => form.member_status === 'Member')
    }

    static sortByYahrzeitAsc = (a, b) => {
        return new Date(a.yahrzeit).getTime() - new Date(b.yahrzeit).getTime();
    }

    static async createYahrzeitCollection(monthSelection) {
        let collection = new YahrzeitCollection();
        await collection.init();
        this.addCalculatedData();
        this.applyMonthFilter(monthSelection)
        await this.addProfileStatusData()

        return collection
    }

    _yahrzeitFetchError = `Could not retrieve Yahrzeit forms from Breeze. Exiting.`
}
