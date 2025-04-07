import { YahrzeitForm } from '@/services/yahrzeitService';

interface YahrzeitTableProps {
  forms: YahrzeitForm[];
}

// Define column configuration
interface ColumnConfig {
  header: string;
  field: keyof YahrzeitForm;
  render?: (form: YahrzeitForm) => React.ReactNode;
}

export default function YahrzeitTable({ forms }: YahrzeitTableProps) {
  // Column configuration with headers and corresponding form fields
  const columns: ColumnConfig[] = [
    { 
      header: 'Mourner', 
      field: 'profile_first_name',
      render: (form) => `${form.profile_first_name} ${form.profile_last_name}`
    },
    { header: 'Status', field: 'member_status' },
    { header: 'Beloved', field: 'english_name_deceased' },
    { 
      header: 'Date of Passing', 
      field: 'greg_date_of_passing',
      render: (form) => `${form.greg_date_of_passing}${form.sunset_preposition}`
    },
    { header: 'Hebrew Date', field: 'hebrew_date_of_passing' },
    { header: 'Calendar', field: 'calendar' },
    { header: 'Next Yahrzeit', field: 'next_yahrzeit_observed' },
    { header: 'Gregorian', field: 'next_yahrzeit_gregorian' }
  ];

  // Helper function to determine row class based on member status
  const getRowClass = (status: string | undefined): string => {
    if (status === 'Deceased') {
      return 'yahrzeit-row-deceased';
    } else if (status !== 'Member') {
      return 'yahrzeit-row-non-member';
    }
    return '';
  };

  // Helper function to render cell content
  const renderCellContent = (form: YahrzeitForm, column: ColumnConfig): React.ReactNode => {
    if (column.render) {
      return column.render(form);
    }
    return form[column.field];
  };

  return (
    <div className="yahrzeit-table-container">
      <table className="yahrzeit-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {forms.map(form => (
            <tr key={form.id} className={getRowClass(form.member_status)}>
              {columns.map((column, index) => (
                <td key={index}>{renderCellContent(form, column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 