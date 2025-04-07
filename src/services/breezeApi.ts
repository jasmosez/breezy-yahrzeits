import { prisma } from '@/lib/prisma';

export class BreezeApiService {
  private baseUrl: string;
  private apiKey: string;
  private formId: string;
  private configObj: { headers: { 'Content-Type': string; 'Api-Key': string } };

  constructor() {
    // Initialize with empty values
    this.baseUrl = '';
    this.apiKey = '';
    this.formId = '';
    this.configObj = {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': '',
      },
    };
  }

  async initialize(organizationId: string) {
    // Fetch organization credentials from database
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    this.baseUrl = `https://${organization.breezeSubdomain}.breezechms.com/api/`;
    this.apiKey = organization.breezeApiKey;
    this.formId = organization.breezeFormId;
    this.configObj.headers['Api-Key'] = this.apiKey;
  }

  async fetchYahrzeitForms() {
    const url = `${this.baseUrl}forms/list_form_entries?form_id=${this.formId}&details=1`;
    
    try {
      const response = await fetch(url, this.configObj);
      
      if (!response.ok) {
        throw new Error(`Breeze API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching yahrzeit forms:', error);
      throw error;
    }
  }

  async fetchProfile(profileId: string) {
    const url = `${this.baseUrl}people/${profileId}`;
    
    try {
      const response = await fetch(url, this.configObj);
      
      if (!response.ok) {
        throw new Error(`Breeze API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching profile ${profileId}:`, error);
      throw error;
    }
  }
} 