import React, { useState } from 'react';
import { Search, FileText, Printer, ShieldCheck, Download } from 'lucide-react';
import { Layout } from '../components/Layout';
import { MOCK_REPORTS } from '../data/labData';
import type { DiagnosticReport } from '../data/labData';
import jsPDF from 'jspdf';

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

  const downloadPDF = () => {
    if (!currentReport) return;

    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 86, 179);
    doc.text('AFTAB CLINIC DIAGNOSTIC LABORATORY', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('ISO Accredited Pathology & Medical Testing Laboratory', 20, yPosition);
    yPosition += 15;

    // Report ID
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Report ID: ${currentReport.reportId}`, 20, yPosition);
    yPosition += 15;

    // Patient Info
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.text(`Patient Name: ${currentReport.patientName}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Age / Gender: ${currentReport.patientAge} Yrs / ${currentReport.patientGender}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Sample Date: ${currentReport.bookingDate}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Department: ${currentReport.category}`, 20, yPosition);
    yPosition += 15;

    // Test Name
    doc.setFontSize(14);
    doc.setTextColor(0, 86, 179);
    doc.text(`Test: ${currentReport.testName}`, 20, yPosition);
    yPosition += 15;

    // Results Table
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Table Header
    doc.setFillColor(230, 240, 250);
    doc.rect(20, yPosition - 5, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Parameter', 22, yPosition);
    doc.text('Result', 80, yPosition);
    doc.text('Unit', 110, yPosition);
    doc.text('Reference Range', 130, yPosition);
    doc.text('Status', 170, yPosition);
    yPosition += 10;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    currentReport.results.forEach((result) => {
      doc.text(result.parameter, 22, yPosition);
      doc.text(result.value, 80, yPosition);
      doc.text(result.unit, 110, yPosition);
      doc.text(result.referenceRange, 130, yPosition);
      doc.setTextColor(result.status === 'Abnormal' ? 239 : 16, result.status === 'Abnormal' ? 68 : 185, result.status === 'Abnormal' ? 68 : 129);
      doc.text(result.status, 170, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 7;
    });

    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;

    // Pathologist Signature
    doc.setFontSize(10);
    doc.text('Pathologist:', 20, yPosition);
    yPosition += 7;
    doc.setFontSize(12);
    doc.text('Dr. S. A. Aftab', 20, yPosition);
    yPosition += 5;
    doc.setFontSize(9);
    doc.text(currentReport.pathologist, 20, yPosition);
    yPosition += 15;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Electronically Verified & Signed', 20, yPosition);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 150, yPosition);

    // Save PDF
    doc.save(`${currentReport.reportId}_Report.pdf`);
  };

  return (
    <div className="app-container">
      <Layout>
        <main className="main-content">
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
            {/* Header */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1rem',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-light)',
                marginBottom: '1.25rem',
              }}
            >
              <h1 style={{ fontSize: '1.375rem', color: 'var(--primary-blue)', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={24} />
                Online Diagnostic Lab Reports
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Search and view signed digital lab reports directly using your Report Reference ID.
              </p>

              {/* Report Search Bar */}
              <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                <div className="input-wrapper" style={{ flex: 1, minWidth: '220px' }}>
                  <Search className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter Report ID (e.g. AC-2026-8891)..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                  Search
                </button>
              </form>

              {/* Quick Demo Helper */}
              <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
                <span>Try Demo IDs:</span>
                <button
                  type="button"
                  onClick={() => { setSearchId('AC-2026-8891'); setCurrentReport(MOCK_REPORTS['AC-2026-8891']); setErrorMsg(''); }}
                  style={{ background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', border: 'none', padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                >
                  AC-2026-8891 (CBC)
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchId('AC-2026-9042'); setCurrentReport(MOCK_REPORTS['AC-2026-9042']); setErrorMsg(''); }}
                  style={{ background: 'var(--primary-green-light)', color: 'var(--primary-green)', border: 'none', padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                >
                  AC-2026-9042 (Diabetes)
                </button>
              </div>

              {errorMsg && (
                <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-red)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', marginTop: '0.875rem' }}>
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
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {/* Report Letterhead Header */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderBottom: '2px solid var(--primary-blue)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/logo.png" alt="Aftab Clinic Logo" style={{ height: '48px', objectFit: 'contain' }} />
                    <div>
                      <h2 style={{ fontSize: '1.125rem', color: 'var(--primary-blue)', margin: 0 }}>
                        AFTAB CLINIC DIAGNOSTIC LABORATORY
                      </h2>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        ISO Accredited Pathology & Medical Testing Laboratory
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      OFFICIAL REPORT
                    </span>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-dark)', marginTop: '0.25rem' }}>
                      ID: {currentReport.reportId}
                    </div>
                  </div>
                </div>

                {/* Patient Info Bar */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-slate)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem 1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.8125rem',
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
                <h3 style={{ fontSize: '1rem', color: 'var(--primary-blue)', marginBottom: '0.875rem' }}>
                  Test: {currentReport.testName}
                </h3>

                {/* Test Results Table with Responsive Scroll */}
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', minWidth: '550px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', textAlign: 'left', fontSize: '0.8125rem' }}>
                        <th style={{ padding: '0.625rem 0.75rem' }}>PARAMETER</th>
                        <th style={{ padding: '0.625rem 0.75rem' }}>RESULT</th>
                        <th style={{ padding: '0.625rem 0.75rem' }}>UNIT</th>
                        <th style={{ padding: '0.625rem 0.75rem' }}>REFERENCE RANGE</th>
                        <th style={{ padding: '0.625rem 0.75rem' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReport.results.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.8125rem' }}>
                          <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>{row.parameter}</td>
                          <td style={{ padding: '0.625rem 0.75rem', fontWeight: 700, color: row.status === 'Abnormal' ? 'var(--error-red)' : 'var(--primary-blue)' }}>
                            {row.value}
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-muted)' }}>{row.unit}</td>
                          <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-muted)' }}>{row.referenceRange}</td>
                          <td style={{ padding: '0.625rem 0.75rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.4rem',
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
                </div>

                {/* Pathologist Signature */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <ShieldCheck size={16} color="var(--primary-green)" /> Electronically Verified & Signed
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'cursive', fontSize: '1.125rem', color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>
                      Dr. S. A. Aftab
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                      {currentReport.pathologist}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button
                    onClick={downloadPDF}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem' }}
                  >
                    <Download size={15} /> Download PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem' }}
                  >
                    <Printer size={15} /> Print Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </Layout>
    </div>
  );
};
