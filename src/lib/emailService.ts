import nodemailer from 'nodemailer';
import { YahrzeitForm } from '@/services/yahrzeitService';
import { getCurrentOrganization } from '@/lib/auth';

// Default email templates (fallback if database templates are not available)
const defaultTemplates = {
  subject: (details: any) => `Yahrzeit Reminder: ${details.english_name_deceased}`,
  text: (details: any) => `
Dear ${details.first_name},

This is a reminder that the yahrzeit for ${details.english_name_deceased} (${details.relationship}) will be observed on ${details.next_yahrzeit_observed}.

The date of passing was ${details.greg_date_of_passing} (${details.hebrew_date_of_passing}).

Please let us know if you have any questions.

Best regards,
Your Synagogue
  `,
  html: (details: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Yahrzeit Reminder</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .content {
      margin-bottom: 20px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="cid:thisistheyahrzeitbanner" alt="Yahrzeit Banner" style="max-width: 100%;">
    </div>
    <div class="content">
      <p>Dear ${details.first_name},</p>
      
      <p>This is a reminder that the yahrzeit for <strong>${details.english_name_deceased}</strong> (${details.relationship}) will be observed on <strong>${details.next_yahrzeit_observed}</strong>.</p>
      
      <p>The date of passing was ${details.greg_date_of_passing} (${details.hebrew_date_of_passing}).</p>
      
      <p>Please let us know if you have any questions.</p>
      
      <p>Best regards,<br>Your Synagogue</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `
};

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isDevelopmentMode: boolean = process.env.NODE_ENV !== 'production';
  private isInitialized: boolean = false;

  constructor() {
    // Don't initialize in constructor - do it lazily when needed
  }

  // Initialize the transporter
  private async initEmailService() {
    if (this.isInitialized) return;
    
    let emailConfig: any;
    try {
      // In development, use a test SMTP server
      if (this.isDevelopmentMode) {
        console.log('Development mode: Using Ethereal Mail for testing');
        
        // Create a test account on Ethereal
        const testAccount = await nodemailer.createTestAccount();
        
        emailConfig = {
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        };
      } else {
        // In production, use the organization's SMTP settings
        emailConfig = await this.getSmtpSettings();
      }
      
      this.transporter = nodemailer.createTransport(emailConfig);
      
      // Verify connection configuration
      await this.transporter.verify();
      console.log('Email service initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  // Get email templates from database or use defaults
  private async getEmailTemplates() {
    // TODO: handle no templates as an organization setting
    try {
      const organization = await getCurrentOrganization();
      if (!organization) {
        throw new Error('Authentication error: No organization found');
      }

      // Check if organization has templates
      if (!organization.subjectTemplate && !organization.textTemplate && !organization.htmlTemplate) {
        console.warn('No email templates found in organization, using defaults');
        return defaultTemplates;
      }

      // Use organization templates or fall back to defaults
      return {
        subject: (details: any) => organization.subjectTemplate ? 
          this.replaceTemplateVariables(organization.subjectTemplate, details) : 
          defaultTemplates.subject(details),
        text: (details: any) => organization.textTemplate ? 
          this.replaceTemplateVariables(organization.textTemplate, details) : 
          defaultTemplates.text(details),
        html: (details: any) => organization.htmlTemplate ? 
          this.replaceTemplateVariables(organization.htmlTemplate, details) : 
          defaultTemplates.html(details)
      };
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  // Replace template variables with actual values
  private replaceTemplateVariables(template: string, details: any): string {
    let result = template;
    for (const [key, value] of Object.entries(details)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }

  // Get SMTP settings from database
  private async getSmtpSettings() {
    try {
      const organization = await getCurrentOrganization();
      if (!organization) {
        throw new Error('No organization found');
      }

      // Check if organization has SMTP settings
      if (!organization.smtpHost || !organization.smtpPort || !organization.smtpUsername || !organization.smtpPassword) {
        throw new Error('Incomplete SMTP settings for organization');
      }

      return {
        from: organization.emailFrom || 'noreply@example.com',
        bcc: organization.emailBcc || '',
        smtp: {
          host: organization.smtpHost,
          port: organization.smtpPort,
          secure: organization.smtpSecure || false,
          auth: {
            user: organization.smtpUsername,
            pass: organization.smtpPassword,
          },
        }
      };
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
      throw error;
    }
  }

  // Send a single email
  private async sendEmail(form: YahrzeitForm) {

    const details = {
      email: form.profile_email?.trim() || '',
      first_name: form.profile_first_name?.trim() || '',
      relationship: form.relationship?.trim() || 'beloved deceased',
      english_name_deceased: form.english_name_deceased?.trim() || '',
      next_yahrzeit_observed: form.next_yahrzeit_observed || '',
      greg_date_of_passing: form.greg_date_of_passing || '',
      sunset_preposition: form.sunset_preposition || '',
      hebrew_date_of_passing: form.hebrew_date_of_passing || '',
      calendar: form.calendar || '',
      next_yahrzeit_gregorian: form.next_yahrzeit_gregorian || '',
    };

    if (!details.email) {
      throw new Error('No email address provided');
    }

    // Get email templates
    const templates = await this.getEmailTemplates();
    
    // Get organization for email settings
    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error('Authentication error: No organization found');
    }

    try {
      const info = await this.transporter!.sendMail({
        from: organization.emailFrom || 'noreply@example.com',
        to: details.email,
        bcc: organization.emailBcc || '',
        subject: templates.subject(details),
        text: templates.text(details),
        html: templates.html(details),
        // TODO: genericize attachments
        attachments: [{
          filename: 'yahrzeit_banner.jpeg',
          path: './public/assets/yahrzeit_banner.jpeg',
          cid: 'thisistheyahrzeitbanner'
        }]
      });

      console.log(`Email sent: ${info.messageId} (${details.first_name}, ${details.email})`);
      
      // In development, log the preview URL
      if (this.isDevelopmentMode) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: this.isDevelopmentMode ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Send emails to multiple recipients
  public async sendEmails(forms: YahrzeitForm[]) {
    // Initialize the service if needed
    if (!this.isInitialized) {
      await this.initEmailService();
    }
    
    const results = [];
    
    for (const form of forms) {
      try {
        const result = await this.sendEmail(form);
        results.push({ 
          success: true, 
          formId: form.id,
          email: form.profile_email,
          name: form.profile_first_name,
          deceasedName: form.english_name_deceased,
          messageId: result.messageId,
          previewUrl: result.previewUrl
        });
      } catch (error) {
        results.push({ 
          success: false, 
          formId: form.id,
          email: form.profile_email,
          name: form.profile_first_name,
          deceasedName: form.english_name_deceased,
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    return results;
  }
}

// Export a singleton instance
export const emailService = new EmailService(); 