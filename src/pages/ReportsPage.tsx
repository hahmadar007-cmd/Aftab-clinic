import React, { useState } from 'react';
import { Search, FileText, Printer, ShieldCheck } from 'lucide-react';
import { MOCK_REPORTS } from '../data/labData';
import type { DiagnosticReport } from '../data/labData';
import { AppBar } from '../components/AppBar';

export const ReportsPage: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [currentReport, setCurrentReport] = useState<DiagnosticReport | null>(MOCK_REPORTS['AC-2026-8891']);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanId = searchId.trim().toUpperCase();
    if (MOCK_REPORTS[cleanId]) {
      setCurrentReport(MOCK_REPORTS[cleanId]);
    } else {
      setErrorMsg(`No laboratory report found for ID "${searchId}". Try sample ID: AC-2026-8891 or AC-2026-9042`);
    }
  };

  return (
    <div className="app-container">
      <AppBar />

      <main className="main-content">
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Header */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem 2rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)',
              marginBottom: '1.75rem',
            }}
          >
            <h1 style={{ fontSize: '1.625rem', color: 'var(--primary-blue)', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <FileText size={28} />
              Online Diagnostic Lab Report Viewer
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Search and view signed digital lab reports directly using your Report Reference ID.
            </p>

            {/* Report Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <div className="input-wrapper" style={{ flex: 1 }}>
                <Search className="input-icon" size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter Report ID (e.g. AC-2026-8891 or AC-2026-9042)..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
                Search Report
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div style={{ marginTop: '0.875rem', fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>Try Demo Report IDs:</span>
              <button
                type="button"
                onClick={() => { setSearchId('AC-2026-8891'); setCurrentReport(MOCK_REPORTS['AC-2026-8891']); setErrorMsg(''); }}
                style={{ background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                AC-2026-8891 (CBC Normal)
              </button>
              <button
                type="button"
                onClick={() => { setSearchId('AC-2026-9042'); setCurrentReport(MOCK_REPORTS['AC-2026-9042']); setErrorMsg(''); }}
                style={{ background: 'var(--primary-green-light)', color: 'var(--primary-green)', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                AC-2026-9042 (Diabetes Checkup)
              </button>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-red)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginTop: '1rem' }}>
                {errorMsg}
              </div>
            )}
          </div>

          {/* Report Viewer Card */}
          {currentReport && (
            <div
              className="card fade-in"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Report Letterhead Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid var(--primary-blue)',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src="/logo.png" alt="Aftab Clinic Logo" style={{ height: '60px', objectFit: 'contain' }} />
                  <div>
                    <h2 style={{ fontSize: '1.375rem', color: 'var(--primary-blue)', margin: 0 }}>
                      AFTAB CLINIC DIAGNOSTIC LABORATORY
                    </h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                      ISO Accredited Pathology & Medical Testing Laboratory
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', padding: '0.25rem 0.625rem', borderRadius: '4px' }}>
                    OFFICIAL REPORT
                  </span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)', marginTop: '0.375rem' }}>
                    ID: {currentReport.reportId}
                  </div>
                </div>
              </div>

              {/* Patient Info Bar */}
              <div
                style={{
                  backgroundColor: 'var(--bg-slate)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.75rem',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Patient Name</span>
                  <strong>{currentReport.patientName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Age / Gender</span>
                  <strong>{currentReport.patientAge} Yrs / {currentReport.patientGender}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Sample Date</span>
                  <strong>{currentReport.bookingDate}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Department</span>
                  <strong>{currentReport.category}</strong>
                </div>
              </div>

              {/* Report Title */}
              <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-blue)', marginBottom: '1rem' }}>
                Test: {currentReport.testName}
              </h3>

              {/* Test Results Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', textAlign: 'left', fontSize: '0.8125rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>PARAMETER</th>
                    <th style={{ padding: '0.75rem 1rem' }}>RESULT</th>
                    <th style={{ padding: '0.75rem 1rem' }}>UNIT</th>
                    <th style={{ padding: '0.75rem 1rem' }}>REFERENCE RANGE</th>
                    <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReport.results.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{row.parameter}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: row.status === 'Abnormal' ? 'var(--error-red)' : 'var(--primary-blue)' }}>
                        {row.value}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.unit}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{row.referenceRange}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: row.status === 'Abnormal' ? '#fef2f2' : '#ecfdf5',
                            color: row.status === 'Abnormal' ? 'var(--error-red)' : 'var(--primary-green)',
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pathologist Signature */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <ShieldCheck size={16} color="var(--primary-green)" /> Electronically Verified & Signed
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'cursive', fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>
                    Dr. S. A. Aftab
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                    {currentReport.pathologist}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8125rem' }}
                >
                  <Printer size={16} /> Print Report
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
