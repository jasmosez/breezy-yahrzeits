import 'dotenv/config'
import nodemailer from 'nodemailer'
import {from, bcc, getSubject, getTextBody, getHtmlBody} from './email_template.js'
import {EMAIL, ENGLISH_NAME_DECEASED, FIRST_NAME_MOURNER, PROFILE, RELATIONSHIP} from './form_constants.js'


export const sendEmails = (filteredForms) => {

  let transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.PORT,
    auth: {
        user: process.env.USERNAME,
        pass: process.env.PASS
    }
  });

  // per form 
  filteredForms.forEach(async form => {
    // assign sendMail variables
    const details = {
      email: form.response[EMAIL],
      first_name: form.profile_first_name,
      relationship: form.response[RELATIONSHIP],
      english_name_deceased: form.response[ENGLISH_NAME_DECEASED],
      yahr_in_selected_cal: form.response.yahr_in_selected_cal,
      g_date_of_passing: form.response.g_date_of_passing,
      sunset_preposition: form.response.sunset_preposition,
      hd_date_of_passing: form.response.hd_date_of_passing,
      calendar: form.response.calendar,
      g_yahr_date: form.response.g_yahr_date
    }
    const to = details.email
    const subject = getSubject(details)
    const text = getTextBody(details)
    const html = getHtmlBody(details)
  
    // send it
    let info = await transporter.sendMail({
      from,
      to,
      bcc,
      subject,
      text,
      html,
      attachments: [{
        filename: 'yahrzeit_banner.jpeg',
        path: 'assets/yahrzeit_banner.jpeg',
        cid: 'thisistheyahrzeitbanner'
      }]
    });
  
    // log it
    console.log("Message sent: %s (%s - %s)" , info.messageId, details.first_name, details.email);
    
  });
}