'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { generateMonthOptions, parseMonthValue, MonthOption } from '@/lib/dateUtils';
import { YahrzeitForm } from '@/services/yahrzeitService';

export default function DashboardPage() {
  const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [forms, setForms] = useState<YahrzeitForm[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const membersAndDeceased = forms.filter(form => form.member_status === 'Member' || form.member_status === 'Deceased');
  const members = membersAndDeceased.filter(form => form.member_status === 'Member');


  useEffect(() => {
    // Generate month options when component mounts
    setMonthOptions(generateMonthOptions());
    
    // Set default selection to next month
    if (monthOptions.length > 0) {
      console.log(monthOptions);
      setSelectedMonth(monthOptions[1].value);
    }
  }, []);

  useEffect(() => {
    // Fetch data when selected month changes
    if (selectedMonth) {
      fetchYahrzeits();
    }
  }, [selectedMonth]);

  const fetchYahrzeits = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { month, year } = parseMonthValue(selectedMonth);
      
      const queryParams = new URLSearchParams();
      if (month !== null) queryParams.append('month', month.toString());
      if (year !== null) queryParams.append('year', year.toString());
      
      const response = await fetch(`/api/yahrzeits?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch yahrzeits');
      }
      
      const data = await response.json();
      setForms(data.forms);
      setCount(data.count);
    } catch (err) {
      setError('Error fetching yahrzeit data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleDownloadCsv = () => {
    // TODO: Implement CSV download
  };

  const handleDownloadText = () => {
    // TODO: Implement text file download
  };

  const handleSendEmails = () => {
    // TODO: Implement email sending
  };

  return (
    <Layout>
      <div className="card">
        <h1 style={{ marginBottom: '1rem' }}>
          Yahrzeit Dashboard
        </h1>
        
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label htmlFor="month-select" className="form-label">
            Select Month
          </label>
          <select
            id="month-select"
            className="form-input"
            value={selectedMonth}
            onChange={handleMonthChange}
            disabled={loading}
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {loading ? (
          <p>Loading yahrzeit data...</p>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <p>
                Found <strong>{count}</strong> yahrzeits for the selected period.
              </p>
            </div>
            
            {forms.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button 
                    className="button" 
                    onClick={handleDownloadCsv}
                    disabled={loading}
                  >
                      Download CSV ({count})
                  </button>
                  <button 
                    className="button" 
                    onClick={handleDownloadText}
                    disabled={loading}
                  >
                    Download Shabbat Text ({membersAndDeceased.length})
                  </button>
                  <button 
                    className="button" 
                    onClick={handleSendEmails}
                    disabled={loading}
                  >
                    Send Emails ({members.length})
                  </button>
                </div>
                
                <div style={{ overflowX: 'auto', fontSize: '0.75rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Mourner</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Beloved</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Date of Passing</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Hebrew Date</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Calendar</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Next Yahrzeit</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Gregorian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.map(form => {
                        // Determine text color based on member status
                        const textColor = form.member_status !== 'Member' ? 'var(--text-very-light)' : 'inherit';

                        // Apply italics to any status other than 'Member' or 'Deceased'
                        const fontStyle = form.member_status !== 'Member' && form.member_status !== 'Deceased' ? 'italic' : 'normal';
                        
                        return (
                          <tr key={form.id} style={{ color: textColor, fontStyle }}>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                              {form.profile_first_name} {form.profile_last_name}
                            </td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                              {form.member_status}
                            </td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                              {form.english_name_deceased}
                            </td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                              {form.greg_date_of_passing}{form.sunset_preposition}
                            </td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                              {form.hebrew_date_of_passing}
                            </td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                              {form.calendar}
                            </td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                              {form.next_yahrzeit_observed}
                            </td>
                            <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                              {form.next_yahrzeit_gregorian}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 