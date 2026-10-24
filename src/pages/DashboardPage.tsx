import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MessageCircle,
  Clock,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldCheck,
  Award,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HEALTH_PACKAGES } from '../data/labData';
import { Layout } from '../components/Layout';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { useLabData } from '../context/LabDataContext';

export const DashboardPage: React.FC = () => {
  const { user, whatsAppConfig, isCloudConnected } = useAuth();
  const { bookings, reports } = useLabData();
  const [showStandardsModal, setShowStandardsModal] = useState(false);

  const whatsappUrl = getWhatsAppUrl(
    whatsAppConfig.phoneNumber,
    'Hello Aftab Clinic, I am logged into the patient portal and would like to ask a question.'
  );

  // Filter bookings for current logged-in patient (or all for admin preview)
  const patientBookings = bookings.filter((b) => {
    if (user?.isAdmin) return true;
    if (!user) return false;
    return (
      b.userId === user.id ||
      b.userEmail === user.email ||
      b.phoneNumber === user.email ||
      b.patientName.toLowerCase() === user.fullName.toLowerCase()
    );
  });

  // Calculate ready reports for the patient
  const patientReports = reports.filter((r) => {
    if (user?.isAdmin) return r.status === 'ready';
    if (!user) return false;
    return (
      r.status === 'ready' &&
      (r.userId === user.id ||
        (r.patientEmail && r.patientEmail.toLowerCase() === user.email?.toLowerCase()) ||
        (r.patientPhone && r.patientPhone === user.email))
    );
  });

  // Strict workflow state status helper - guarantees NO contradictory messages
  const getDerivedStatus = (booking: typeof bookings[0]) => {
    const readyTestsCount = booking.tests.filter((t) => t.reportStatus === 'ready').length;
    const totalTestsCount = booking.tests.length;

    switch (booking.status) {
      case 'Completed':
        return {
          bg: '#dcfce7',
          color: '#15803d',
          label: '✅ All Reports Ready',
          message: 'All verified diagnostic reports are ready to view and download.',
        };
      case 'Partially Ready':
        return {
          bg: '#ffedd5',
          color: '#c2410c',
          label: `⚠️ Partial Results Ready (${readyTestsCount}/${totalTestsCount})`,
          message: `Results ready for ${readyTestsCount} of ${totalTestsCount} tests. Remaining tests are actively in progress.`,
        };
      case 'In Process':
        return {
          bg: '#e0e7ff',
          color: '#3730a3',
          label: '🔬 Testing in Progress',
          message: 'Diagnostic testing is actively running in the laboratory.',
        };
      case 'Sample Collected':
        return {
          bg: '#f3e8ff',
          color: '#6b21a8',
          label: '🩸 Sample Received at Lab',
          message: 'Sample received at laboratory. Accessioning complete.',
        };
      case 'Confirmed':
        return {
          bg: '#e0f2fe',
          color: '#0369a1',
          label: '📅 Appointment Confirmed',
          message: 'Your diagnostic appointment and phlebotomist slot have been confirmed.',
        };
      case 'Action Required':
        return {
          bg: '#fee2e2',
          color: '#b91c1c',
          label: '⚠️ Action Required',
          message: 'Please review your booking details or contact the clinic.',
        };
      case 'Cancelled':
        return {
          bg: '#f1f5f9',
          color: '#475569',
          label: '❌ Cancelled',
          message: 'This appointment booking was cancelled.',
        };
      case 'Pending':
      default:
        return {
          bg: '#fef3c7',
          color: '#b45309',
          label: '⏳ Awaiting Sample Collection',
          message: 'Phlebotomist visit / clinic sample collection is pending.',
        };
    }
  };

  return (
    <div className="app-container">
      <Layout>
        <main className="main-content">
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>

            {/* 1. Compact Patient Header Bar (Low Profile, No Decorative Clutter) */}
            <div
              className="fade-in"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-light)',
                marginBottom: '1.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                    Welcome, {user?.fullName || 'Patient'}
                  </h1>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      backgroundColor: isCloudConnected ? '#dcfce7' : '#fef3c7',
                      color: isCloudConnected ? '#15803d' : '#b45309',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {isCloudConnected ? '● Live Cloud Connected' : '● Demo Sandbox Mode'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Patient Diagnostic Portal • Aftab Clinic & Diagnostic Laboratory
                </p>
              </div>

              <button
                onClick={() => setShowStandardsModal(true)}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Award size={14} color="var(--primary-green)" />
                <span>About Lab Standards</span>
              </button>
            </div>

            {/* 2. Primary Actions: "Book a Test" & "My Reports" First */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              {/* Action 1: Book a Test */}
              <Link
                to="/tests"
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  textDecoration: 'none',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--primary-blue-light)',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--primary-blue-light)',
                      color: 'var(--primary-blue)',
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Search size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-blue)', margin: '0 0 0.2rem 0' }}>
                      Book a Diagnostic Test
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                      Browse 80+ lab tests with transparent PKR rates
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} color="var(--primary-blue)" />
              </Link>

              {/* Action 2: My Reports */}
              <Link
                to="/reports"
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  textDecoration: 'none',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #bbf7d0',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d', margin: '0 0 0.2rem 0' }}>
                        My Reports
                      </h3>
                      {patientReports.length > 0 && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#15803d', color: '#ffffff', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                          {patientReports.length} Ready
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                      View & download verified pathologist PDF results
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} color="#15803d" />
              </Link>
            </div>

            {/* 3. My Bookings Section (Follows Immediately After Primary Actions) */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.125rem', color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--primary-blue)" />
                  My Diagnostic Bookings ({patientBookings.length})
                </h2>
                <Link to="/book" style={{ fontSize: '0.8125rem', color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }}>
                  + New Booking
                </Link>
              </div>

              {patientBookings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#ffffff', border: '1px dashed var(--border-light)' }}>
                  <Clock size={32} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p style={{ color: 'var(--text-dark)', fontWeight: 600, margin: '0 0 0.25rem 0' }}>No active bookings found</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                    Book a test to track appointment schedule and access signed medical reports online.
                  </p>
                  <Link to="/tests" className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}>
                    Browse Test Catalog
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {patientBookings.map((booking) => {
                    const statusInfo = getDerivedStatus(booking);
                    const matchingReports = reports.filter((r) => r.bookingId === booking.id && r.status === 'ready');
                    const readyTestsCount = booking.tests.filter((t) => t.reportStatus === 'ready').length;
                    const hasAnyReadyReport = readyTestsCount > 0 || matchingReports.length > 0;

                    return (
                      <div
                        key={booking.id}
                        className="card fade-in"
                        style={{
                          backgroundColor: '#ffffff',
                          borderLeft: `4px solid ${statusInfo.color}`,
                          padding: '1.125rem',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        {/* Header Details */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary-blue)' }}>
                                {booking.patientName}
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                Ref: {booking.id}
                              </span>
                              {booking.age && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Age: {booking.age} ({booking.gender})
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                              <span>📅 {booking.date}</span>
                              <span>•</span>
                              <span>🏥 {booking.collectionType}</span>
                              <span>•</span>
                              <span>⏰ Slot: {booking.timeSlot || 'Morning'}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: statusInfo.bg,
                                color: statusInfo.color,
                                padding: '0.25rem 0.65rem',
                                borderRadius: 'var(--radius-full)',
                                display: 'inline-block',
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>

                        {/* Derived Message - Single Source of Truth */}
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: statusInfo.color,
                            backgroundColor: statusInfo.bg,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Info size={14} style={{ flexShrink: 0 }} />
                          <span>{statusInfo.message}</span>
                        </div>

                        {/* Ordered Tests & Individual Report Status */}
                        <div style={{ backgroundColor: 'var(--bg-slate)', borderRadius: '6px', padding: '0.625rem', marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            Ordered Tests ({readyTestsCount}/{booking.tests.length} Ready):
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {booking.tests.map((test, idx) => {
                              const isReady = test.reportStatus === 'ready';
                              const matchingTestRep = matchingReports.find(
                                (r) => r.testNames?.includes(test.name) || r.testName.includes(test.name)
                              );
                              const targetReportId = test.reportId || matchingTestRep?.reportId;

                              return (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.35rem 0.5rem',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '4px',
                                    fontSize: '0.8125rem',
                                    flexWrap: 'wrap',
                                    gap: '0.25rem',
                                  }}
                                >
                                  <div>
                                    <span style={{ fontWeight: 700, color: 'var(--primary-blue)', marginRight: '0.35rem' }}>
                                      [{test.code}]
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{test.name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.35rem' }}>
                                      (Rs. {test.price.toLocaleString()})
                                    </span>
                                  </div>

                                  <div>
                                    {isReady || matchingTestRep ? (
                                      <Link
                                        to={`/reports?id=${targetReportId || booking.id}`}
                                        style={{
                                          fontSize: '0.6875rem',
                                          fontWeight: 700,
                                          backgroundColor: '#dcfce7',
                                          color: '#15803d',
                                          padding: '0.15rem 0.45rem',
                                          borderRadius: '4px',
                                          textDecoration: 'none',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.2rem',
                                        }}
                                      >
                                        <FileText size={11} /> View Report
                                      </Link>
                                    ) : (
                                      <span style={{ fontSize: '0.6875rem', color: '#b45309', backgroundColor: '#fef3c7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                        Result Pending
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Separate Payment & Report Action Row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', paddingTop: '0.25rem' }}>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-dark)' }}>
                            <span style={{ fontWeight: 700 }}>Total: Rs. {booking.totalAmount.toLocaleString()} PKR</span>
                            <span style={{ marginLeft: '0.5rem', color: booking.paymentStatus === 'Paid' ? '#15803d' : '#b45309', fontWeight: 600, fontSize: '0.75rem', backgroundColor: booking.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                              Payment: {booking.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid (Due at Collection)'}
                            </span>
                          </div>

                          {hasAnyReadyReport && (
                            <Link
                              to={`/reports?id=${matchingReports[0]?.reportId || booking.id}`}
                              className="btn btn-primary"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <FileText size={14} /> View / Download Report
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Health Screening Packages (Moved Lower Down) */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.125rem', color: 'var(--text-dark)', margin: 0 }}>
                  Preventive Health Screening Packages
                </h2>
                <Link to="/packages" style={{ fontSize: '0.8125rem', color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }}>
                  View All Packages →
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                {HEALTH_PACKAGES.slice(0, 3).map((pkg) => (
                  <div key={pkg.id} className="card" style={{ borderTop: '3px solid var(--primary-green)', padding: '1rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary-green)', backgroundColor: 'var(--primary-green-light)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {pkg.code}
                    </span>
                    <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary-blue)', margin: '0.35rem 0 0.25rem 0' }}>
                      {pkg.name}
                    </h3>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                      Rs. {pkg.price.toLocaleString()}{' '}
                      <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        Rs. {pkg.regularPrice.toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Includes {pkg.testsIncluded.length} key diagnostic tests.
                    </p>
                    <Link to="/packages" className="btn btn-outline" style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem' }}>
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Support & Operating Hours */}
            <div
              className="card mobile-stack"
              style={{
                backgroundColor: '#ffffff',
                borderLeft: '4px solid var(--whatsapp-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1rem 1.25rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '0.9375rem', color: 'var(--text-dark)', margin: '0 0 0.2rem 0' }}>
                  Laboratory Sample Collection & Support
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  Mon – Sat: 08:00 AM – 10:00 PM | Sun: 09:00 AM – 04:00 PM
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp Helpline</span>
              </a>
            </div>

            {/* Standards & Accreditation Modal (Moved from Main Page Flow) */}
            {showStandardsModal && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  zIndex: 9999,
                }}
              >
                <div
                  className="card fade-in"
                  style={{
                    maxWidth: '520px',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={22} color="var(--primary-green)" />
                      <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--primary-blue)' }}>
                        Laboratory Quality Standards
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowStandardsModal(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                    >
                      <X size={20} color="var(--text-muted)" />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                      <ShieldCheck size={20} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h4 style={{ fontSize: '0.875rem', margin: '0 0 0.2rem 0' }}>Automated Clinical Precision</h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                          High-throughput clinical chemistry and hematology analyzers for reliable calibration and minimal turnaround time.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                      <CheckCircle size={20} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h4 style={{ fontSize: '0.875rem', margin: '0 0 0.2rem 0' }}>Consultant Pathologist Verification</h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                          All diagnostic result values are signed and approved by senior FCPS consultant pathologists prior to delivery.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                      <AlertTriangle size={20} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <h4 style={{ fontSize: '0.875rem', margin: '0 0 0.2rem 0' }}>Proficiency Quality Controls</h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                          Daily two-level internal quality control (IQC) and external quality assessment program compliance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowStandardsModal(false)}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                  >
                    Close
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
