// Load environment variables from a .env file
import {} from 'dotenv/config'

// Set default options
export const config = {
    smtp: {
        host: process.env.HOST,
        port: process.env.PORT,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
    },
    breeze: {
        subdomain: process.env.BREEZE_SUBDOMAIN,
        apiKey: process.env.BREEZE_API,
        formId: process.env.BREEZE_FORM_ID,
    },
    formConstants: {
        observanceField: process.env.OBSERVATION_SELECTION,
        gregorianCalendarOption: process.env.GREGORIAN_CAL,
        hebrewCalendarOption: process.env.HEBREW_CAL,
        gregorianDateOfPassingField: process.env.GREGORIAN_DATE_OF_PASSING,
        sunsetField: process.env.SUNSET_SELECTION,
        beforeSunsetOption: process.env.BEFORE_SUNSET,
        afterSunsetOption: process.env.AFTER_SUNSET,
        unsureSunsetOption: process.env.UNSURE_SUNSET,

        // profileField: process.env.PROFILE,
        personIdField: 'person_id',
        firstNameMournerField: 'first_name',
        lastNameMournerField: 'last_name',
        profileStatusField: process.env.PROFILE_STATUS,
        profileEmailListField: process.env.PROFILE_EMAIL_LIST,
        isPrimaryField: 'is_primary',
        allowBulkField: 'allow_bulk',

        // relationshipField: process.env.RELATIONSHIP,
        // englishNameDeceasedField: process.env.ENGLISH_NAME_DECEASED,
        // member: 'Member',
        // deceased: 'Deceased',
        // emailField: process.env.EMAIL,
    }
  // Add more options here
};

