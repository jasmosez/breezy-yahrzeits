import 'dotenv/config'
import nodemailer from 'nodemailer'
import {from, to, cc, subject, textBody, htmlBody} from './email_template.js'

async function main() {

  let transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.PORT,
    auth: {
        user: process.env.USERNAME,
        pass: process.env.PASS
    }
  });
  
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from,
    to,
    cc,
    subject,
    textBody,
    htmlBody
  });

  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
