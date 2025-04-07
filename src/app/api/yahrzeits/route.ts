import { NextRequest, NextResponse } from 'next/server';
import { getCurrentOrganization } from '@/lib/auth';
import { YahrzeitService } from '@/services/yahrzeitService';

export async function GET(request: NextRequest) {
  try {
    // Get the current organization
    const organization = await getCurrentOrganization();
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null;
    
    // Initialize services
    const yahrzeitService = new YahrzeitService();
    await yahrzeitService.initialize(organization.id);
    
    // Fetch and process forms
    const forms = await yahrzeitService.fetchYahrzeitForms();
    console.log(`Found ${forms.length} forms`)

    const processedForms = yahrzeitService.processYahrzeitData(forms);
    console.log(`Processed ${processedForms.length} forms`)

    const filteredForms = yahrzeitService.filterByMonth(processedForms, month, year);
    console.log(`Filtered ${filteredForms.length} forms`)

    const formsWithProfileData = await yahrzeitService.addProfileData(filteredForms);
    console.log(`Added profile data to ${formsWithProfileData.length} forms`)
 
    return NextResponse.json({
      forms: formsWithProfileData,
      count: formsWithProfileData.length,
    });
  } catch (error) {
    console.error('Error fetching yahrzeits:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 