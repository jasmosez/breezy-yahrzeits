import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        email: 'test@example.com',
        password: hashedPassword,
        breezeSubdomain: 'testorg',
        breezeApiKey: 'test_api_key',
        breezeFormId: 'test_form_id',
        emailTemplate: 'test_template',
        emailFrom: 'test@example.com',
        formFieldMappings: {
          firstName: 'first_name',
          lastName: 'last_name',
          email: 'email',
          phone: 'phone',
          address: 'address',
          city: 'city',
          state: 'state',
          zip: 'zip',
          country: 'country',
          yahrzeitDate: 'yahrzeit_date',
          yahrzeitHebrewDate: 'yahrzeit_hebrew_date',
          yahrzeitName: 'yahrzeit_name',
          yahrzeitRelationship: 'yahrzeit_relationship',
          yahrzeitNotes: 'yahrzeit_notes'
        }
      }
    });

    console.log('Created test organization:', organization);
  } catch (error) {
    console.error('Error creating test organization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 