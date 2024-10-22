// Load environment variables from a .env file
import {} from 'dotenv/config'
import nodemailer from 'nodemailer'

// Define the smtp configuration object
let smtp
if (process.env.ENV === 'PRODUCTION') {
    smtp = {
        host: process.env.HOST,
        port: process.env.PORT,
        auth: {
            user: process.env.USERNAME,
            pass: process.env.PASSWORD
        }
    }
} else {
    const testAccount = await nodemailer.createTestAccount();
    smtp = {
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    }
}

// form constant mapping based on form id
const formMap = {
    572588: {
        observanceField: '2092221479',
        gregorianCalendarOption: '403',
        hebrewCalendarOption: '404',
        gregorianDateOfPassingField: '2092221480',
        sunsetField: '2092221488',
        beforeSunsetOption: '757',
        afterSunsetOption: '758',
        unsureSunsetOption: '759',
        relationshipField: '2092221477',
        englishNameDeceasedField: '2092221474',
        profileStatusField: '2092220507',
        profileEmailListField: '1684609214',
    }
}


export const config = {
    breeze: {
        subdomain: process.env.BREEZE_SUBDOMAIN,
        apiKey: process.env.BREEZE_API,
        formId: process.env.BREEZE_FORM_ID,
    },
    envIsProduction: process.env.ENV === 'PRODUCTION',
    formConstants: {
        ...formMap[process.env.BREEZE_FORM_ID],
        personIdField: 'person_id',
        firstNameMournerField: 'first_name',
        lastNameMournerField: 'last_name',
        isPrimaryField: 'is_primary',
        allowBulkField: 'allow_bulk',
    },
    smtp: smtp,
};

