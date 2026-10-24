import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  FileText,
  Printer,
  ShieldCheck,
  Download,
  Lock,
  AlertTriangle,
  Eye,
  Clock,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLabData } from '../context/LabDataContext';
import { useAuth } from '../context/AuthContext';
import type { LabReportRecord } from '../context/LabDataContext';
import { canUserAccessReport, createAuthorizedBlobUrl } from '../utils/reportSecurity';
import jsPDF from 'jspdf';

export const ReportsPage: React.FC = () => {
  const { reports, getPrivateReportPDF } = useLabData();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'my_reports' | 'search'>('my_reports');
  const [searchId, setSearchId] = useState('');
  const [currentReport, setCurrentReport] = useState<LabReportRecord | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfRevokeFn, setPdfRevokeFn] = useState<(() => void) | null>(null);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState<string | null>(null);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);

  // Filter reports owned by current authenticated user
  const myReports = reports.filter((r) => {
    if (isAdmin) return true;
    if (!user) return false;
    const access = canUserAccessReport(user, r);
    return access.allowed;
  });

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfRevokeFn) pdfRevokeFn();
    };
  }, [pdfRevokeFn]);

  // Load a report securely with authorization check
  const loadReportSecurely = async (targetReport: LabReportRecord) => {
    // 1. Strict authorization enforcement
    const access = canUserAccessReport(user, targetReport);
    if (!access.allowed) {
      setCurrentReport(null);
      if (pdfRevokeFn) pdfRevokeFn();
      setPdfBlobUrl(null);
      setAccessDeniedMsg(access.reason || 'Access denied: You do not have permission to view this medical record.');
      setNotFoundMsg(null);
      return;
    }

    // Authorization passed!
    setAccessDeniedMsg(null);
    setNotFoundMsg(null);
    setCurrentReport(targetReport);

    // 2. If it has an uploaded PDF, load it from private secure storage
    if (targetReport.hasPDF) {
      setIsLoadingPDF(true);
      try {
        const rawDataUrl = await getPrivateReportPDF(targetReport.reportId);
        if (rawDataUrl) {
          if (pdfRevokeFn) pdfRevokeFn();
          const { blobUrl, revoke } = createAuthorizedBlobUrl(rawDataUrl);
          setPdfBlobUrl(blobUrl);
          setPdfRevokeFn(() => revoke);
        } else {
          setPdfBlobUrl(null);
        }
      } catch (err) {
        console.error('Failed to load private PDF:', err);
      } finally {
        setIsLoadingPDF(false);
      }
    } else {
      if (pdfRevokeFn) pdfRevokeFn();
      setPdfBlobUrl(null);
      setPdfRevokeFn(null);
    }
  };

  // Cleanup active blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfRevokeFn) pdfRevokeFn();
    };
  }, [pdfRevokeFn]);

  // Auto-search / load on URL ?id=... parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paramId = queryParams.get('id');

    if (paramId) {
      setSearchId(paramId);
      const cleanId = paramId.trim().toUpperCase();
      const match = reports.find(
        (r) =>
          r.reportId.toUpperCase() === cleanId ||
          r.bookingId.toUpperCase() === cleanId
      );

      if (match) {
        loadReportSecurely(match);
      } else {
        setCurrentReport(null);
        setNotFoundMsg(`No laboratory report found for reference ID "${paramId}". Please verify the ID.`);
        setAccessDeniedMsg(null);
      }
    } else if (myReports.length > 0 && !currentReport) {
      // Load patient's most recent report by default
      loadReportSecurely(myReports[0]);
    }
  }, [location.search, reports, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotFoundMsg(null);
    setAccessDeniedMsg(null);

    const clean = searchId.trim().toUpperCase();
    if (!clean) return;

    const match = reports.find(
      (r) =>
        r.reportId.toUpperCase() === clean ||
        r.bookingId.toUpperCase() === clean ||
        r.patientName.toUpperCase().includes(clean)
    );

    if (match) {
      loadReportSecurely(match);
    } else {
      setCurrentReport(null);
      setNotFoundMsg(`No report record matching "${searchId}". Check your Booking Reference or Report ID.`);
    }
  };

  const handleDownloadPDF = () => {
    if (!currentReport) return;

    // If an official uploaded PDF blob exists, trigger direct download
    if (pdfBlobUrl) {
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = currentReport.fileName || `${currentReport.reportId}_${currentReport.patientName.replace(/\s+/g, '_')}_Report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Fallback: Generate signed PDF using jsPDF for structured test parameter rows
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(0, 86, 179);
    doc.text('AFTAB CLINIC DIAGNOSTIC LABORATORY', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('ISO Certified Clinical Pathology & Medical Testing Laboratory', 20, y);
    y += 14;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Official Report ID: ${currentReport.reportId}   |   Booking Ref: ${currentReport.bookingId}`, 20, y);
    y += 6;
    doc.line(20, y, 190, y);
    y += 8;

    doc.setFontSize(10);
    doc.text(`Patient Name: ${currentReport.patientName}`, 20, y);
    y += 6;
    doc.text(`Age / Gender: ${currentReport.patientAge || '35 Yrs'} / ${currentReport.patientGender || 'Patient'}`, 20, y);
    y += 6;
    doc.text(`Date of Issue: ${currentReport.date}`, 20, y);
    y += 6;
    doc.text(`Investigation: ${currentReport.testName}`, 20, y);
    y += 10;

    if (currentReport.results && currentReport.results.length > 0) {
      doc.setFillColor(240, 245, 255);
      doc.rect(20, y - 5, 170, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Parameter', 22, y);
      doc.text('Result', 80, y);
      doc.text('Unit', 110, y);
      doc.text('Reference Range', 140, y);
      y += 8;
      doc.setFont('helvetica', 'normal');

      currentReport.results.forEach((r) => {
        doc.text(r.parameter, 22, y);
        doc.text(r.value, 80, y);
        doc.text(r.unit, 110, y);
        doc.text(r.referenceRange, 140, y);
        y += 7;
      });
      y += 6;
    }

    doc.line(20, y, 190, y);
    y += 8;
    doc.setFontSize(10);
    doc.text('Verified & Electronically Signed:', 20, y);
    y += 6;
    doc.setFontSize(11);
    doc.text(currentReport.pathologist, 20, y);

    doc.save(`${currentReport.reportId}_Report.pdf`);
  };

  return (
    <div className="app-container">
      <Layout>
        <main className="main-content">
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
            {/* Page Header */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-light)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', color: 'var(--primary-blue)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <FileText size={26} />
                    Patient Diagnostic Reports & Downloads
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem', marginBottom: 0 }}>
                    Authenticated, private medical report delivery. Verified reports are available to view and download directly in your account.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#ecfdf5',
                      color: 'var(--primary-green)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    <ShieldCheck size={16} /> Authenticated Access Only
                  </span>
                </div>
              </div>

              {/* Navigation Tabs between "My Reports" and "Search by ID" */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <button
                  onClick={() => setActiveTab('my_reports')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: activeTab === 'my_reports' ? 'var(--primary-blue)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'my_reports' ? '3px solid var(--primary-blue)' : '3px solid transparent',
                    marginBottom: '-0.5rem',
                  }}
                >
                  📁 My Reports ({myReports.length})
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: activeTab === 'search' ? 'var(--primary-blue)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'search' ? '3px solid var(--primary-blue)' : '3px solid transparent',
                    marginBottom: '-0.5rem',
                  }}
                >
                  🔍 Search by Reference ID
                </button>
              </div>

              {/* Search Bar (if on search tab or quick lookup) */}
              {activeTab === 'search' && (
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  <div className="input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
                    <Search className="input-icon" size={18} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter Report ID (e.g. AC-REP-123456) or Booking Ref (AC-BK-889101)..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                    Search Report
                  </button>
                </form>
              )}
            </div>

            {/* Error & Security Alerts */}
            {accessDeniedMsg && (
              <div
                className="fade-in"
                style={{
                  backgroundColor: '#fef2f2',
                  border: '2px solid #ef4444',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <Lock size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', margin: '0 0 0.25rem 0' }}>
                    🔒 Access Restricted: Medical Privacy Protection
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#b91c1c', margin: 0, lineHeight: 1.5 }}>
                    {accessDeniedMsg}
                  </p>
                  {!isAuthenticated && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <Link to="/login" className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}>
                        Sign In to Your Patient Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {notFoundMsg && (
              <div
                className="fade-in"
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#92400e',
                  fontSize: '0.875rem',
                }}
              >
                <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                <span>{notFoundMsg}</span>
              </div>
            )}

            {/* TAB 1: MY REPORTS DIRECTORY */}
            {activeTab === 'my_reports' && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.125rem', color: 'var(--text-dark)', marginBottom: '0.875rem' }}>
                  Available Reports in Your Account ({myReports.length})
                </h2>

                {myReports.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#ffffff' }}>
                    <FileText size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                    <h3 style={{ fontSize: '1.125rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                      No diagnostic reports ready yet
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                      Once our clinical pathologists verify and sign your diagnostic test results, your reports will immediately appear here.
                    </p>
                    <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '0.8125rem' }}>
                      View Live Booking Status
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {myReports.map((report) => {
                      const isSelected = currentReport?.reportId === report.reportId;
                      return (
                        <div
                          key={report.reportId}
                          className="card fade-in"
                          style={{
                            backgroundColor: '#ffffff',
                            border: isSelected ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: 'var(--primary-blue-light)',
                                  color: 'var(--primary-blue)',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                }}
                              >
                                {report.reportId}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: report.status === 'ready' ? '#dcfce7' : '#fee2e2',
                                  color: report.status === 'ready' ? '#15803d' : '#b91c1c',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: 'var(--radius-full)',
                                }}
                              >
                                {report.status === 'ready' ? '✅ Ready' : 'Replaced'}
                              </span>
                            </div>

                            <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', margin: '0.35rem 0 0.25rem 0', fontWeight: 700 }}>
                              {report.testName}
                            </h3>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                              Patient: <strong>{report.patientName}</strong> • Ref: <strong>{report.bookingId}</strong>
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                              <span>📅 Issue Date: {report.date}</span>
                              <span>👨‍⚕️ Pathologist: {report.pathologist}</span>
                              {report.hasPDF && (
                                <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                                  📎 Official PDF Document ({report.fileSizeFormatted || 'Ready'})
                                </span>
                              )}
                              {report.isReplacement && (
                                <span style={{ color: '#b45309', fontWeight: 600 }}>
                                  ⚠️ Revised Version (Reason: {report.replacementReason || 'Updated findings'})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* View / Download Button */}
                          <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                            <button
                              onClick={() => loadReportSecurely(report)}
                              className="btn btn-primary"
                              style={{ flex: 1, fontSize: '0.8125rem', padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                            >
                              <Eye size={15} /> View / Download Report
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* REPORT VIEWER SECTION (When a report is loaded and authorized) */}
            {currentReport && (
              <div
                className="card fade-in"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-lg)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                {/* Header Banner */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
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
                      OFFICIAL MEDICAL RECORD
                    </span>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-dark)', marginTop: '0.25rem' }}>
                      Report ID: {currentReport.reportId}
                    </div>
                  </div>
                </div>

                {/* Audit & Verification Meta Bar */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.8125rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Patient Name</span>
                    <strong>{currentReport.patientName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Booking Reference</span>
                    <strong>{currentReport.bookingId}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Published On</span>
                    <strong>{new Date(currentReport.publishedAt || currentReport.date).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Uploaded & Published By</span>
                    <strong>{currentReport.publishedBy || currentReport.uploadedBy || 'Administrator'}</strong>
                  </div>
                </div>

                {/* If the report has an uploaded PDF, show PDF viewer embed */}
                {currentReport.hasPDF && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} color="var(--primary-blue)" />
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-dark)' }}>
                          Official Signed PDF Result ({currentReport.fileName || 'Report.pdf'})
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Size: {currentReport.fileSizeFormatted || 'PDF'}
                      </span>
                    </div>

                    {isLoadingPDF ? (
                      <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                        <Clock size={32} color="var(--primary-blue)" style={{ animation: 'spin 1s infinite linear', marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Decrypting & loading authorized document...</p>
                      </div>
                    ) : pdfBlobUrl ? (
                      <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '550px', backgroundColor: '#525659' }}>
                        <iframe
                          src={`${pdfBlobUrl}#toolbar=1`}
                          title="Medical Report PDF Preview"
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                      </div>
                    ) : (
                      <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.875rem' }}>
                        PDF file could not be rendered from private storage. You can still download the signed report below.
                      </div>
                    )}
                  </div>
                )}

                {/* If structured parameter results exist */}
                {currentReport.results && currentReport.results.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                      Structured Findings & Clinical Parameters
                    </h3>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '550px' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', fontSize: '0.8125rem', textAlign: 'left' }}>
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
                              <td style={{ padding: '0.625rem 0.75rem', fontWeight: 700, color: row.status === 'High' || row.status === 'Low' ? 'var(--error-red)' : 'var(--primary-blue)' }}>
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
                                    backgroundColor: row.status === 'Normal' ? '#ecfdf5' : '#fef2f2',
                                    color: row.status === 'Normal' ? 'var(--primary-green)' : 'var(--error-red)',
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
                  </div>
                )}

                {/* Pathologist & Sign-off Footer */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <ShieldCheck size={18} color="var(--primary-green)" /> Electronically Verified & Signed Document
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'cursive', fontSize: '1.125rem', color: 'var(--primary-blue)', marginBottom: '0.2rem' }}>
                      Dr. S. A. Aftab
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                      {currentReport.pathologist}
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDownloadPDF}
                    className="btn btn-primary"
                    style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Download size={16} /> Download Official PDF Report
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-outline"
                    style={{ fontSize: '0.875rem', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Printer size={16} /> Print Report
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
