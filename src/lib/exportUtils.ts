import { YahrzeitForm, YahrzeitService } from '@/services/yahrzeitService';
import { json2csvAsync } from 'json-2-csv';

/**
 * Generates a CSV file from yahrzeit forms data
 * @param forms Array of yahrzeit forms
 * @returns Promise that resolves when the CSV is downloaded
 */
export const generateCsvFromForms = async (forms: YahrzeitForm[]): Promise<void> => {
  try {
    // Convert forms data to CSV
    const csv = await json2csvAsync(forms);
    
    // Create a blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up the download
    link.setAttribute('href', url);
    link.setAttribute('download', `yahrzeit_forms_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    // Add to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw new Error('Failed to generate CSV file');
  }
};

/**
 * Groups yahrzeit forms by week
 * @param forms Array of yahrzeit forms -- assume sorted by yahrzeit date
 * @returns Record with week dates as keys and arrays of forms as values
 */
export const groupByWeek = (forms: YahrzeitForm[]): Record<string, YahrzeitForm[]> => {
  const weeks: Record<string, YahrzeitForm[]> = {};
  
  forms.forEach(form => {
    const date = new Date(form.next_yahrzeit_gregorian);
    // Get the Saturday of the week containing this date
    const dayOfWeek = date.getDay();
    const daysUntilSaturday = 6 - dayOfWeek;
    const saturdayDate = new Date(date);
    saturdayDate.setDate(date.getDate() + daysUntilSaturday);
    
    // Format as YYYY-MM-DD for consistent key
    const weekKey = saturdayDate.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    
    weeks[weekKey].push(form);
  });
  
  return weeks;
};

/**
 * Generates a text file with yahrzeit information grouped by week
 * @param forms Array of yahrzeit forms -- probably already sorted by yahrzeit date, but we sort it again just in case
 * @returns Promise that resolves when the text file is downloaded
 */
export const generateTextFromForms = (forms: YahrzeitForm[]): void => {
  try {
    // Filter forms to only include members and deceased
    const filteredForms = forms.filter(form => 
      form.member_status === 'Member' || form.member_status === 'Deceased'
    );
    
    // Sort forms by yahrzeit date, just in case
    const sortedForms = [...filteredForms].sort(YahrzeitService.compareNextYahrzeitGregorian);
    
    // Generate text content
    let textContent = '';
    
    // Group by week
    const weeks = groupByWeek(sortedForms);

    // Format each week
    for (const [Saturday, weekForms] of Object.entries(weeks)) {
      const [year, month, day] = Saturday.split('-').map(Number);
      const SaturdayDate = new Date(year, month - 1, day);
      textContent += `${SaturdayDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}\n`;
      
      // Add each yahrzeit for this week
      weekForms.forEach(form => {
        const yahrzeitDate = new Date(form.next_yahrzeit_gregorian);
        textContent += `${form.english_name_deceased}, ${form.relationship} of ${form.profile_first_name || ''} ${form.profile_last_name || ''} (${yahrzeitDate.toLocaleDateString()})\n`;
      });
      
      textContent += '\n';
    }
    
    // Create a blob and download link
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up the download
    link.setAttribute('href', url);
    link.setAttribute('download', `yahrzeit_text_for_shabbat_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    
    // Add to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating text file:', error);
    throw new Error('Failed to generate text file');
  }
}; 