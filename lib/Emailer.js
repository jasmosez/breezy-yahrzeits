import nodemailer from 'nodemailer'
import { config } from '../config.js'
const {from, bcc, getSubject, getTextBody, getHtmlBody} = config.emailTemplate

export class Emailer {
  constructor() {
    this.client = null
  }

  async init() {
    if (config.smtp) {
      this.client = nodemailer.createTransport(config.smtp);
      return
    } 

    throw new Error('SMTP configuration not found')
  }

  async sendEmail(form) {
    const details = {
      email: form.profile_email.trim(),
      first_name: form.profile_first_name.trim(),
      relationship: form.response[config.formConstants.relationshipField].trim(),
      english_name_deceased: form.response[config.formConstants.englishNameDeceasedField].trim(),
      next_yahrzeit_observed: form.next_yahrzeit_observed,
      greg_date_of_passing: form.greg_date_of_passing,
      sunset_preposition: form.sunset_preposition,
      hebrew_date_of_passing: form.hebrew_date_of_passing,
      calendar: form.calendar,
      next_yahrzeit_gregorian: form.next_yahrzeit_gregorian
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
