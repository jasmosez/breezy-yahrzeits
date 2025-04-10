import { EmailService } from './emailService';

export interface SmtpStatus {
    isTestMode: boolean;
    smtpHost?: string;
}

class EmailServiceRegistry {
    private services: Map<string, EmailService> = new Map();

    async getServiceForOrganization(organizationId: string): Promise<EmailService> {
        if (!this.services.has(organizationId)) {
            console.log(`Initializing email service for organization ${organizationId}`);
            const service = new EmailService();
            await service.initEmailService(organizationId);
            this.services.set(organizationId, service);
        }

        return this.services.get(organizationId)!;
    }
  
    async getSmtpStatus(organizationId: string): Promise<SmtpStatus | undefined> {
        const service = await this.getServiceForOrganization(organizationId);
        return service.getSmtpStatus();
    }
}

export const emailServiceRegistry = new EmailServiceRegistry();