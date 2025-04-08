import { HDate } from '@hebcal/core';
import { prisma } from '@/lib/prisma';
import { BreezeApiService } from './breezeApi';

// Define the interface for processed yahrzeit forms
export interface YahrzeitForm {
  id: string;
  response: any;
  greg_date_of_passing: string;
  sunset_preposition: string;
  hebrew_date_of_passing: string;
  calendar: string;
  next_yahrzeit_observed: string;
  next_yahrzeit_gregorian: string;
  profile_first_name?: string;
  profile_last_name?: string;
  profile_email?: string;
  member_status?: string;
  month_number: number;
  year: number;
  english_name_deceased: string;
}

// Define an interface for processing results
export interface YahrzeitProcessingResult {
  forms: YahrzeitForm[];
  errors: YahrzeitProcessingError[];
}

// Define an interface for processing errors
export interface YahrzeitProcessingError {
  formId: string;
  deceasedName: string;
  error: string;
  stage: 'processing' | 'profile';
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export class YahrzeitService {
  private formFieldMappings: any;
  private organizationId: string;
  private breezeApi: BreezeApiService;

  constructor() {
    this.formFieldMappings = {};
    this.organizationId = '';
    this.breezeApi = new BreezeApiService();
  }

  async initialize(organizationId: string) {
    this.organizationId = organizationId;
    
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    this.formFieldMappings = organization.formFieldMappings;
    
    // Initialize the Breeze API service
    await this.breezeApi.initialize(organizationId);
  }

  fetchYahrzeitForms() {
    return this.breezeApi.fetchYahrzeitForms();
  }

  dateFromStr(dateStr: string): Date {
    // Creates a Date object from 'mm/dd/yyyy' or 'yyyy-mm-dd'
    let month: number;
    let day: number;
    let year: number;

    if (dateStr.search('/') > 0) {
      const dateArr = dateStr.split('/');
      month = parseInt(dateArr[0]) - 1;
      day = parseInt(dateArr[1]);
      year = parseInt(dateArr[2]);
    } else {
      const dateArr = dateStr.split('-');
      month = parseInt(dateArr[1]) - 1;
      day = parseInt(dateArr[2]);
      year = parseInt(dateArr[0]);
    }

    return new Date(year, month, day);
  }

  getNextYahrzeitHebrewDate(hebrewDateOfPassing: HDate): HDate {
    const today = new Date();
    const currentYear = new HDate().getFullYear();
    const nextYear = currentYear + 1;

    // Calculate yahrzeit for current year
    const yahrzeitCurrentYear = new HDate(hebrewDateOfPassing.getDate(), hebrewDateOfPassing.getMonth(), currentYear);
    
    // If current year's yahrzeit has passed, use next year
    if (yahrzeitCurrentYear.greg() < today) {
      return new HDate(hebrewDateOfPassing.getDate(), hebrewDateOfPassing.getMonth(), nextYear);
    }
    
    return yahrzeitCurrentYear;
  }

  processYahrzeitData(forms: any[]): YahrzeitProcessingResult {
    const localeOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    const errors: YahrzeitProcessingError[] = [];
    const processedForms = forms.map(form => {
      try {
        // Get gregorian date of passing
        const dateOfPassing = this.dateFromStr(form.response[this.formFieldMappings.gregorianDateOfPassingField]);
        const now = new Date();
        
        if (dateOfPassing > now) {
          throw new Error(`Date of passing is in the future: ${dateOfPassing.toLocaleDateString('en-US', localeOptions)}`);
        }

        // Get sunset preposition and hebrew date of passing
        let sunsetPreposition = '';
        let hebrewDateOfPassing: HDate;
        
        const sunset = form.response[this.formFieldMappings.sunsetField]?.value?.toString();
        if (sunset === this.formFieldMappings.afterSunsetOption) {
          sunsetPreposition = ' after sunset';
          hebrewDateOfPassing = new HDate(new Date(dateOfPassing.getTime() + DAY_IN_MS));
        } else if (sunset === this.formFieldMappings.beforeSunsetOption) {
          sunsetPreposition = ' before sunset';
          hebrewDateOfPassing = new HDate(dateOfPassing);
        } else {
          hebrewDateOfPassing = new HDate(dateOfPassing);
        }

        // Get calendar and next yahrzeit date
        const observance = form.response[this.formFieldMappings.observanceField]?.value?.toString();
        let calendar: string;
        let nextYahrzeitGregorianDate: Date;
        let nextYahrzeitObserved: string;

        if (observance === this.formFieldMappings.gregorianCalendarOption) {
          calendar = 'Gregorian';
          const currentGregorianYear = now.getFullYear();
          const yahrzeitInCurrentGregorianYear = new Date(currentGregorianYear, dateOfPassing.getMonth(), dateOfPassing.getDate());

          if (yahrzeitInCurrentGregorianYear < now) {
            nextYahrzeitGregorianDate = new Date(currentGregorianYear + 1, dateOfPassing.getMonth(), dateOfPassing.getDate());
          } else {
            nextYahrzeitGregorianDate = yahrzeitInCurrentGregorianYear;
          }

          nextYahrzeitObserved = nextYahrzeitGregorianDate.toLocaleDateString('en-US', localeOptions);
        } else if (observance === this.formFieldMappings.hebrewCalendarOption) {
          calendar = 'Hebrew';
          const nextYahrzeitHebrewDate = this.getNextYahrzeitHebrewDate(hebrewDateOfPassing);
          nextYahrzeitGregorianDate = nextYahrzeitHebrewDate.greg();
          nextYahrzeitObserved = nextYahrzeitHebrewDate.render() as unknown as string;
        } else {
          throw new Error(`Invalid observance selection: ${observance}`);
        }

        // Return processed form data
        return {
          ...form,
          greg_date_of_passing: dateOfPassing.toLocaleDateString('en-US', localeOptions),
          sunset_preposition: sunsetPreposition,
          hebrew_date_of_passing: hebrewDateOfPassing.render(),
          calendar,
          next_yahrzeit_observed: nextYahrzeitObserved,
          next_yahrzeit_gregorian: nextYahrzeitGregorianDate.toLocaleDateString('en-US', localeOptions),
          month_number: nextYahrzeitGregorianDate.getMonth() + 1,
          year: nextYahrzeitGregorianDate.getFullYear(),
          english_name_deceased: form.response[this.formFieldMappings.englishNameDeceasedField]
        } as YahrzeitForm;
      } catch (error) {
        console.error(`Error processing form ${form.id}:`, error);
        errors.push({
          formId: form.id,
          deceasedName: form.english_name_deceased,
          error: error instanceof Error ? error.message : String(error),
          stage: 'processing'
        });
        return null;
      }
    }).filter(Boolean) as YahrzeitForm[];

    return { forms: processedForms, errors };
  }

  filterByMonth(forms: YahrzeitForm[], targetMonth: number | null, targetYear: number | null): YahrzeitForm[] {
    if (targetMonth === null || targetYear === null) {
      return forms;
    }
    
    return forms.filter(form => 
      form.month_number === targetMonth && form.year === targetYear
    );
  }

  async addProfileData(forms: YahrzeitForm[]): Promise<YahrzeitProcessingResult> {
    if (!forms.length) {
      return { forms, errors: [] };
    }

    const errors: YahrzeitProcessingError[] = [];

    // Get the person ID field from the form field mappings
    const personIdField = this.formFieldMappings.personIdField;
    const firstNameField = this.formFieldMappings.firstNameMournerField;
    const lastNameField = this.formFieldMappings.lastNameMournerField;
    const profileStatusField = this.formFieldMappings.profileStatusField;
    const profileEmailListField = this.formFieldMappings.profileEmailListField;
    const isPrimaryField = this.formFieldMappings.isPrimaryField;
    const allowBulkField = this.formFieldMappings.allowBulkField;

    // Filter forms to only include those with a person ID
    const formsWithProfileIds = forms.filter(form => {
      const formAny = form as any;
      return formAny && formAny[personIdField];
    });

    // Fetch profile data for each form
    const formsWithProfileData = await Promise.all(
      formsWithProfileIds.map(async (form) => {
        try {
          const formAny = form as any;
          const profileId = formAny[personIdField];
          const profile = await this.breezeApi.fetchProfile(profileId);

          // Get profile email, but only if we have a primary email that allows bulk emails
          let profileEmail = '';
          const email = profile.details[profileEmailListField]?.find(
            (el: any) => el[isPrimaryField] === '1' && el[allowBulkField] === '1'
          );

          if (!email?.address) {
            console.error(`Missing profile email. id: ${profile.id}, last name: ${profile[lastNameField]}`);
          } else {
            profileEmail = email.address;
          }

          // Add profile data to form
          return {
            ...form,
            profile_first_name: profile[firstNameField],
            profile_last_name: profile[lastNameField],
            member_status: profile.details[profileStatusField]?.name || "Unknown",
            profile_email: profileEmail
          } as YahrzeitForm;
        } catch (error) {
          console.error(`Failed to get profile info for form ${form.id}:`, error);
          errors.push({
            formId: form.id,
            deceasedName: form.english_name_deceased,
            error: error instanceof Error ? error.message : String(error),
            stage: 'profile'
          });
          return null;
        }
      })
    );

    return { 
      forms: formsWithProfileData.filter(Boolean) as YahrzeitForm[], 
      errors 
    };
  }

  compareNextYahrzeitGregorian(a: YahrzeitForm, b: YahrzeitForm): number {
    return new Date(a.next_yahrzeit_gregorian).getTime() - new Date(b.next_yahrzeit_gregorian).getTime();
  }
} 