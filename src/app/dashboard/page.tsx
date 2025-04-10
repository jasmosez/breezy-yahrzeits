'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import YahrzeitTable from '@/components/YahrzeitTable';
import { generateMonthOptions, parseMonthValue, MonthOption, PLACEHOLDER_OPTION } from '@/lib/dateUtils';
import { YahrzeitForm, YahrzeitProcessingError, MEMBER_STATUS } from '@/services/yahrzeitService';
import { generateCsvFromForms, generateTextFromForms } from '@/lib/exportUtils';
import { SmtpStatus } from '@/lib/emailServiceRegistry';

export default function DashboardPage() {
  const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(PLACEHOLDER_OPTION.value);
  const [forms, setForms] = useState<YahrzeitForm[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [processingErrors, setProcessingErrors] = useState<YahrzeitProcessingError[]>([]);
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);

  const membersAndDeceased = forms.filter(form => form.member_status === MEMBER_STATUS.MEMBER || form.member_status === MEMBER_STATUS.DECEASED);
  const members = membersAndDeceased.filter(form => form.member_status === MEMBER_STATUS.MEMBER);


  useEffect(() => {
    // Generate month options when component mounts
    setMonthOptions(generateMonthOptions());
  }, []);

  useEffect(() => {
    // Fetch data when selected month changes
    if (selectedMonth && selectedMonth !== PLACEHOLDER_OPTION.value) {
      fetchYahrzeits();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const fetchYahrzeits = async () => {
    setLoading(true);

    // Reset data state variables at the beginning
    setError('');
    setProcessingErrors([]);
    setForms([]);
    setCount(0);
    
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
      setProcessingErrors(data.errors || []);
      setSmtpStatus(data.smtpStatus);
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

  const handleExportCsv = async () => {
    try {
      // CSV includes all forms
      await generateCsvFromForms(forms);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Failed to generate CSV file');
    }
  };

  const handleExportText = () => {
    try {
      // Text includes only members and deceased
      generateTextFromForms(membersAndDeceased);
    } catch (error) {
      console.error('Error exporting text:', error);
      setError('Failed to generate text file');
    }
  };

  const handleSendEmails = async () => {
    try {
      
      if (members.length === 0) {
        alert('No eligible members found for email notifications.');
        return;
      }
      
      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to send email notifications to ${members.length} members using ${smtpStatus?.smtpHost}?`
      );
      
      if (!confirmed) {
        return;
      }
      
      // Call the email API endpoint
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forms: members }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send emails');
      }
      
      const result = await response.json();
      
      // Show success message
      alert(`Successfully sent ${result.successfulEmails.length} emails. ${result.failedEmails.length} failed.`);
      
      // Log any failures for debugging
      if (result.failedEmails.length > 0) {
        console.error('Failed to send emails to:', result.failedEmails);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('An error occurred while sending emails. Please try again later.');
    }
  };

  // Group errors by stage
  const processingErrorsByStage = processingErrors.reduce((acc, error) => {
    if (!acc[error.stage]) {
      acc[error.stage] = [];
    }
    acc[error.stage].push(error);
    return acc;
  }, {} as Record<string, YahrzeitProcessingError[]>);

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
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.value === PLACEHOLDER_OPTION.value}
              >
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
        
        {processingErrors.length > 0 && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Processing Errors</h3>
            <p>Some yahrzeit forms could not be processed correctly:</p>
            
            {Object.entries(processingErrorsByStage).map(([stage, errors]) => (
              <div key={stage} style={{ marginTop: '0.5rem' }}>
                <h4 style={{ marginBottom: '0.25rem' }}>
                  {stage === 'processing' ? 'Data Processing Errors' : 'Profile Data Errors'} ({errors.length})
                </h4>
                <ul style={{ marginLeft: '1.5rem' }}>
                  {errors.map((error, index) => (
                    <li key={index}>
                      Form ID: {error.formId} ({error.deceasedName} deceased) - {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
                    onClick={handleExportCsv}
                    disabled={loading}
                  >
                    Download CSV ({count})
                  </button>
                  <button 
                    className="button" 
                    onClick={handleExportText}
                    disabled={loading || selectedMonth === 'all'}
                  >
                    Download Shabbat Text ({membersAndDeceased.length})
                  </button>
                  <button 
                    className="button" 
                    onClick={handleSendEmails}
                    disabled={loading || selectedMonth === 'all'}
                  >
                    {smtpStatus?.isTestMode ? 'Send Test Emails' : 'Send Emails'} ({members.length})
                  </button>
                </div>
                
                <YahrzeitTable forms={forms} />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 