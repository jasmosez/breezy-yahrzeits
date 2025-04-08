export interface MonthOption {
  value: string;
  label: string;
}

export const PLACEHOLDER_OPTION = {
  value: 'placeholder',
  label: '-- Select Month --'
};

export function generateMonthOptions(): MonthOption[] {
  const options: MonthOption[] = [];
  
  // Add placeholder option
  options.push(PLACEHOLDER_OPTION);
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Add current month
  options.push({
    value: `${currentMonth + 1}-${currentYear}`,
    label: `${getMonthName(currentMonth)} ${currentYear}`
  });
  
  // Add next 11 months
  for (let i = 1; i <= 11; i++) {
    const date = new Date(currentYear, currentMonth + i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    options.push({
      value: `${month + 1}-${year}`,
      label: `${getMonthName(month)} ${year}`
    });
  }
  
  // Add "All Yahrzeits" option
  options.push({
    value: 'all',
    label: 'All Yahrzeits'
  });
  
  return options;
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

export function parseMonthValue(value: string): { month: number | null; year: number | null } {
  if (value === 'all') {
    return { month: null, year: null };
  }
  
  const [month, year] = value.split('-').map(Number);
  return { month, year };
} 