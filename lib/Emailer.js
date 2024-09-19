import 'dotenv/config'
import nodemailer from 'nodemailer'
import {from, bcc, getSubject, getTextBody, getHtmlBody} from './email_template.js'
import {EMAIL, ENGLISH_NAME_DECEASED, FIRST_NAME_MOURNER, PROFILE, RELATIONSHIP} from './form_constants.js'

export class Emailer {
  constructor() {
    this.client = null
  }

  async init() {
    // this.client = nodemailer.createTransport({

    // this.client = nodemailer.createTestAccount({
    //   host: process.env.HOST,
    //   port: process.env.PORT,
    //   auth: {
    //     user: process.env.USERNAME,
    //     pass: process.env.PASS
    //   }
    // });

    const testAccount = await nodemailer.createTestAccount();
    this.client = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }});
  }

  async sendEmail(form) {
    const details = {
      email: form.profile_email,
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

    try {
      const info = await this.client.sendMail({
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
  
      console.log("Message sent: %s (%s - %s)" , info.messageId, details.first_name, details.email);

      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error(error)
    } 
  }

  async sendEmails(forms) {
    for (const form of forms) {
      await this.sendEmail(form);
    }
  }
};
