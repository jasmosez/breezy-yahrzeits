'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import YahrzeitTable from '@/components/YahrzeitTable';
import { generateMonthOptions, parseMonthValue, MonthOption, PLACEHOLDER_OPTION } from '@/lib/dateUtils';
import { YahrzeitForm, YahrzeitProcessingError, MEMBER_STATUS } from '@/services/yahrzeitService';
import { generateCsvFromForms, generateTextFromForms } from '@/lib/exportUtils';
import { SmtpStatus } from '@/lib/emailServiceRegistry';
import { FailedEmail } from '@/app/api/email/route';
export default function DashboardPage() {
  const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(PLACEHOLDER_OPTION.value);
  const [forms, setForms] = useState<YahrzeitForm[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingEmails, setSendingEmails] = useState<boolean>(false);
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

      setSendingEmails(true);

      // Process in batches of 4
      const BATCH_SIZE = 4;
      let successCount = 0;
      let failedEmails: FailedEmail[] = [];
      
      // Show progress dialog
      alert(`Starting to send emails in batches of ${BATCH_SIZE}. Please wait for completion...`);

      for (let i = 0; i < members.length; i += BATCH_SIZE) {
        const batch = members.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(members.length / BATCH_SIZE);
        
        console.log(`Processing batch ${batchNumber} of ${totalBatches}`);
        
        try {
          const response = await fetch('/api/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ forms: batch }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send emails');
          }
          
          const result = await response.json();
          successCount += result.successfulEmails.length;
          failedEmails = [...failedEmails, ...result.failedEmails];
          
          // Show progress after each batch
          console.log(`Batch ${batchNumber}/${totalBatches} complete. Success: ${result.successfulEmails.length}, Failed: ${result.failedEmails.length}`);
        } catch (error) {
          console.error(`Error processing batch ${batchNumber}:`, error);
          failedEmails = [...failedEmails, ...batch.map(form => ({
            name: form.profile_first_name,
            email: form.profile_email,
            deceasedName: form.english_name_deceased,
            error: error instanceof Error ? error.message : 'Unknown error'
          }))];
        }
      }
      
      // Show final results
      alert(`Completed sending emails:\n${successCount} successful\n${failedEmails.length} failed`);
      
      // Log any failures for debugging
      if (failedEmails.length > 0) {
        console.error('Failed to send emails to:', failedEmails);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('An error occurred while sending emails. Please try again later.');
    } finally {
      setSendingEmails(false);
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
            disabled={loading || sendingEmails}
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
                    disabled={loading || sendingEmails}
                  >
                    Download CSV ({count})
                  </button>
                  <button 
                    className="button" 
                    onClick={handleExportText}
                    disabled={loading || sendingEmails || selectedMonth === 'all'}
                  >
                    Download Shabbat Text ({membersAndDeceased.length})
                  </button>
                  <button 
                    className="button" 
                    onClick={handleSendEmails}
                    disabled={loading || sendingEmails || selectedMonth === 'all'}
                  >
                    {sendingEmails ? 'Sending emails...' : (smtpStatus?.isTestMode ? 'Send Test Emails' : 'Send Emails')} ({members.length})
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