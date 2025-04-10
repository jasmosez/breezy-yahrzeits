import { NextRequest, NextResponse } from 'next/server';
import { YahrzeitForm } from '@/services/yahrzeitService';
import { emailServiceRegistry } from '@/lib/emailServiceRegistry';
import { getCurrentOrganization } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const organization = await getCurrentOrganization();

    if (!organization) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 400 }
      );
    }

    const emailService = await emailServiceRegistry.getServiceForOrganization(organization.id);
    const { forms } = await request.json();
    
    if (!forms || !Array.isArray(forms) || forms.length === 0) {
      return NextResponse.json(
        { error: 'No valid forms provided' },
        { status: 400 }
      );
    }
    
    // Filter to only include forms with email addresses, first name, and deceased name
    const validForms = forms.filter((form: YahrzeitForm) => 
      form.profile_email && 
      form.profile_first_name && 
      form.english_name_deceased
    );
    
    if (validForms.length === 0) {
      return NextResponse.json(
        { error: 'No forms with valid email addresses found' },
        { status: 400 }
      );
    }

    console.log(`Sending emails to ${validForms.length} valid forms of ${forms.length} total forms received`);
    
    // Send emails
    const results = await emailService.sendEmails(validForms);
    
    // Count successes and failures
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    // Group results
    const successfulEmails = successful.map(r => ({
      name: r.name,
      email: r.email,
      deceasedName: r.deceasedName,
      previewUrl: r.previewUrl
    }));
    
    const failedEmails = failed.map(r => ({
      name: r.name,
      email: r.email,
      deceasedName: r.deceasedName,
      error: r.error
    }));
    
    // Check if we're in development mode
    const isDevelopmentMode = process.env.NODE_ENV !== 'production';
    
    return NextResponse.json({
      success: true,
      isDevelopmentMode,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length
      },
      successfulEmails,
      failedEmails
    });
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
} 