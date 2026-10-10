import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Plus,
  Printer,
  Search,
  X,
  FileText,
  Shield,
  Tag,
  MessageCircle,
  Save,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLabData } from '../context/LabDataContext';
import { useAuth } from '../context/AuthContext';
import type { BookingRecord } from '../context/LabDataContext';
import type { LabTest } from '../data/labData';

export const AdminDashboard: React.FC = () => {
  const {
    tests,
    bookings,
    addTest,
    updateTest,
    deleteTest,
    addBooking,
    updateBookingStatus,
    updateBookingDiscount,
    deleteBooking,
    addReport,
  } = useLabData();

  const { whatsAppConfig, updateWhatsAppConfig } = useAuth();
  const [waPhoneDisplay, setWaPhoneDisplay] = useState(whatsAppConfig.displayPhone);
  const [waPhoneDigits, setWaPhoneDigits] = useState(whatsAppConfig.phoneNumber);
  const [waSaveMsg, setWaSaveMsg] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'tests' | 'reports'>('overview');

  // Search & Filter state
  const [testSearch, setTestSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');

  // Modals state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<BookingRecord | null>(null);
  const [receiptDiscountPercent, setReceiptDiscountPercent] = useState<number>(0);

  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportBooking, setSelectedReportBooking] = useState<BookingRecord | null>(null);

  // Test Modal Form State
  const [testForm, setTestForm] = useState({
    code: '',
    name: '',
    category: 'Biochemistry' as LabTest['category'],
    rate: 500,
    sample: 'Serum Red Top',
    reportingTime: 'Same Day 6 Hours',
  });

  // New Booking Form State
  const [newBookingForm, setNewBookingForm] = useState({
    patientName: '',
    phoneNumber: '',
    age: '30 Yrs',
    gender: 'Male',
    collectionType: 'Clinic Visit',
    testCodesInput: '',
    totalAmount: 1000,
  });

  // New Report Form State
  const [reportForm, setReportForm] = useState({
    testName: 'Blood Complete Examination (CBC)',
    parameter1Name: 'Hemoglobin (Hb)',
    parameter1Val: '14.5',
    parameter1Unit: 'g/dL',
    parameter1Ref: '13.5 - 17.5',
    parameter2Name: 'TLC / White Blood Cells',
    parameter2Val: '7,400',
    parameter2Unit: '/cmm',
    parameter2Ref: '4,000 - 11,000',
    pathologistName: 'Dr. Aftab Ahmed (Consultant Pathologist)',
  });

  // Calculate Statistics
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed').length;
  const totalRevenue = bookings.reduce((sum, b) => (b.paymentStatus === 'Paid' ? sum + b.totalAmount : sum), 0);

  // Test Form Handlers
  const handleOpenTestModal = (test?: LabTest) => {
    if (test) {
      setEditingTest(test);
      setTestForm({
        code: test.code,
        name: test.name,
        category: test.category,
        rate: test.rate,
        sample: test.sample,
        reportingTime: test.reportingTime,
      });
    } else {
      setEditingTest(null);
      setTestForm({
        code: Math.floor(1000 + Math.random() * 9000).toString(),
        name: '',
        category: 'Biochemistry',
        rate: 800,
        sample: 'Serum Red Top',
        reportingTime: 'Same Day 6 Hours',
      });
    }
    setIsTestModalOpen(true);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.name || !testForm.code) return;

    if (editingTest) {
      updateTest(editingTest.id, {
        code: testForm.code,
        name: testForm.name,
        category: testForm.category,
        rate: Number(testForm.rate),
        sample: testForm.sample,
        reportingTime: testForm.reportingTime,
      });
    } else {
      addTest({
        code: testForm.code,
        name: testForm.name,
        category: testForm.category,
        rate: Number(testForm.rate),
        sample: testForm.sample,
        reportingTime: testForm.reportingTime,
      });
    }
    setIsTestModalOpen(false);
  };

  // Receipt Modal Handler
  const handlePrintReceipt = (booking: BookingRecord) => {
    setSelectedReceiptBooking(booking);
    setReceiptDiscountPercent(booking.discountPercent || 0);
    setIsReceiptModalOpen(true);
  };

  const triggerWindowPrint = () => {
    window.print();
  };

  // Walk-in Booking Submission
  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingForm.patientName || !newBookingForm.phoneNumber) return;

    addBooking({
      patientName: newBookingForm.patientName,
      phoneNumber: newBookingForm.phoneNumber,
      age: newBookingForm.age,
      gender: newBookingForm.gender,
      collectionType: newBookingForm.collectionType,
      tests: [
        { code: 'AC-TEST', name: newBookingForm.testCodesInput || 'Diagnostic Screening', price: Number(newBookingForm.totalAmount) },
      ],
      totalAmount: Number(newBookingForm.totalAmount),
    });
    setIsNewBookingModalOpen(false);
  };

  // Report Creation Handler
  const handleOpenReportModal = (booking: BookingRecord) => {
    setSelectedReportBooking(booking);
    setReportForm({
      ...reportForm,
      testName: booking.tests[0]?.name || 'Diagnostic Testing',
    });
    setIsReportModalOpen(true);
  };

  const handlePublishReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportBooking) return;

    addReport({
      bookingId: selectedReportBooking.id,
      patientName: selectedReportBooking.patientName,
      date: new Date().toISOString().split('T')[0],
      testName: reportForm.testName,
      results: [
        {
          parameter: reportForm.parameter1Name,
          value: reportForm.parameter1Val,
          unit: reportForm.parameter1Unit,
          referenceRange: reportForm.parameter1Ref,
          status: 'Normal',
        },
        {
          parameter: reportForm.parameter2Name,
          value: reportForm.parameter2Val,
          unit: reportForm.parameter2Unit,
          referenceRange: reportForm.parameter2Ref,
          status: 'Normal',
        },
      ],
      pathologist: reportForm.pathologistName,
    });

    updateBookingStatus(selectedReportBooking.id, 'Completed', 'Paid');
    setIsReportModalOpen(false);
    alert('Lab Report Published successfully! Available under Patient Reports.');
  };

  // Filtered Lists
  const filteredTestsList = tests.filter(
    (t) =>
      t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.code.includes(testSearch) ||
      t.category.toLowerCase().includes(testSearch.toLowerCase())
  );

  const filteredBookingsList = bookings.filter((b) => (bookingFilter === 'All' ? true : b.status === bookingFilter));

  return (
    <div className="app-container">
      <Layout>
        <main className="main-content">
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
            {/* Header Banner */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: '#ffffff',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-light)',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Shield size={26} color="var(--primary-blue)" />
                  <h1 style={{ fontSize: '1.5rem', color: 'var(--primary-blue)', margin: 0 }}>
                    Aftab Clinic Admin Control Center
                  </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                  Logged in as Administrator (Full privileges: Edit Tests, Manage Bookings, Print Receipts & Publish Reports)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsNewBookingModalOpen(true)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8125rem' }}
                >
                  <Plus size={16} /> Walk-in Counter Booking
                </button>
                <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '0.8125rem' }}>
                  Patient Portal View
                </Link>
              </div>
            </div>

            {/* Tab Bar */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid var(--border-light)',
                paddingBottom: '0.5rem',
                overflowX: 'auto',
              }}
            >
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'overview' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'overview' ? '3px solid var(--primary-blue)' : '3px solid transparent',
                  marginBottom: '-0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                📊 Dashboard Overview
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'bookings' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'bookings' ? '3px solid var(--primary-blue)' : '3px solid transparent',
                  marginBottom: '-0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                📋 Bookings & Cash Receipts ({bookings.length})
              </button>

              <button
                onClick={() => setActiveTab('tests')}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'tests' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'tests' ? '3px solid var(--primary-blue)' : '3px solid transparent',
                  marginBottom: '-0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                🧪 Manage Test Catalog ({tests.length})
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                {/* Key Stats Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  <div className="card" style={{ borderTop: '4px solid var(--primary-blue)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <ShoppingBag size={22} color="var(--primary-blue)" />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Bookings</span>
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {totalBookingsCount}
                    </div>
                  </div>

                  <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <Clock size={22} color="#f59e0b" />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Pending Samples</span>
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {pendingCount}
                    </div>
                  </div>

                  <div className="card" style={{ borderTop: '4px solid var(--primary-green)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <CheckCircle size={22} color="var(--primary-green)" />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Completed Reports</span>
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {completedCount}
                    </div>
                  </div>

                  <div className="card" style={{ borderTop: '4px solid var(--primary-green)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <TrendingUp size={22} color="var(--primary-green)" />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Cash Revenue</span>
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      Rs. {totalRevenue.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Admin WhatsApp Contact Config Card */}
                <div className="card" style={{ marginBottom: '1.75rem', borderLeft: '4px solid var(--primary-green)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <MessageCircle size={22} color="var(--primary-green)" />
                      <div>
                        <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-blue)', margin: 0, fontWeight: 700 }}>
                          Official Clinic WhatsApp Contact Settings
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                          Only logged-in Clinic Administrators can update the official WhatsApp number displayed across the website.
                        </p>
                      </div>
                    </div>
                    {waSaveMsg && (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--primary-green)', fontWeight: 700, backgroundColor: 'var(--success-bg)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                        ✓ WhatsApp Number Updated Successfully!
                      </span>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateWhatsAppConfig({
                        displayPhone: waPhoneDisplay,
                        phoneNumber: waPhoneDigits.replace(/[^0-9]/g, ''),
                      });
                      setWaSaveMsg(true);
                      setTimeout(() => setWaSaveMsg(false), 3000);
                    }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}
                  >
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                        Display Phone Number (Formatted)
                      </label>
                      <input
                        type="text"
                        value={waPhoneDisplay}
                        onChange={(e) => setWaPhoneDisplay(e.target.value)}
                        placeholder="+92 300 1234567"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                        WhatsApp Digits Only (International format)
                      </label>
                      <input
                        type="text"
                        value={waPhoneDigits}
                        onChange={(e) => setWaPhoneDigits(e.target.value)}
                        placeholder="923001234567"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                      />
                    </div>

                    <div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <Save size={16} /> Update WhatsApp Number
                      </button>
                    </div>
                  </form>
                </div>

                {/* Quick Recent Activity */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={20} color="var(--primary-blue)" />
                      Recent Patient Bookings
                    </h3>
                    <button onClick={() => setActiveTab('bookings')} className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
                      View All Bookings
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {bookings.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          padding: '0.875rem 1rem',
                          backgroundColor: 'var(--bg-slate)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{b.patientName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              {b.id}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {b.phoneNumber}</span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {b.tests.map((t) => t.name).join(', ')} • {b.date} ({b.collectionType})
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                            Rs. {b.totalAmount.toLocaleString()}
                          </span>

                          <button
                            onClick={() => handlePrintReceipt(b)}
                            className="btn btn-outline"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'flex', gap: '0.3rem' }}
                          >
                            <Printer size={14} /> Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BOOKINGS & CASH RECEIPTS */}
            {activeTab === 'bookings' && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0 }}>
                      Patient Booking Records
                    </h2>
                    {/* Status Filter */}
                    <select
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value as any)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                      }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <button onClick={() => setIsNewBookingModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
                    <Plus size={16} /> New Counter Booking
                  </button>
                </div>

                <div className="card" style={{ padding: '0.5rem' }}>
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-light)', backgroundColor: 'var(--bg-slate)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Ref ID</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Patient Details</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Tests Booked</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total (PKR)</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Actions & Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookingsList.map((booking) => (
                          <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                              {booking.id}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{booking.patientName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {booking.phoneNumber} • {booking.gender}, {booking.age}
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.8125rem', maxWidth: '240px' }}>
                              {booking.tests.map((t) => t.name).join(', ')}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                              Rs. {booking.totalAmount.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <select
                                value={booking.status}
                                onChange={(e) => updateBookingStatus(booking.id, e.target.value as any)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor:
                                    booking.status === 'Completed'
                                      ? 'var(--success-bg)'
                                      : booking.status === 'Confirmed'
                                      ? 'var(--primary-blue-light)'
                                      : '#fef3c7',
                                  color:
                                    booking.status === 'Completed'
                                      ? 'var(--success-green)'
                                      : booking.status === 'Confirmed'
                                      ? 'var(--primary-blue)'
                                      : '#f59e0b',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Sample Collected">Sample Collected</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handlePrintReceipt(booking)}
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                  title="Print Official Cash Receipt"
                                >
                                  <Printer size={14} /> Receipt
                                </button>

                                <button
                                  onClick={() => handleOpenReportModal(booking)}
                                  className="btn btn-primary"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                  title="Publish Digital Lab Report"
                                >
                                  <FileText size={14} /> Report
                                </button>

                                <button
                                  onClick={() => deleteBooking(booking.id)}
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--error-red)', borderColor: '#fca5a5' }}
                                  title="Delete Booking"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TEST CATALOG CRUD */}
            {activeTab === 'tests' && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0 }}>
                      Laboratory Test Catalog Editor
                    </h2>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                      {tests.length} Total Tests
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search Input */}
                    <div className="input-wrapper" style={{ minWidth: '220px' }}>
                      <Search size={16} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Search code or test name..."
                        value={testSearch}
                        onChange={(e) => setTestSearch(e.target.value)}
                        style={{ padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <button onClick={() => handleOpenTestModal()} className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
                      <Plus size={16} /> Add New Test
                    </button>
                  </div>
                </div>

                <div className="card" style={{ padding: '0.5rem' }}>
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-light)', backgroundColor: 'var(--bg-slate)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Code</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Test Description</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Category</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Rate (PKR)</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Sample Required</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTestsList.map((test) => (
                          <tr key={test.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                              {test.code}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
                              {test.name}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                {test.category}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                              Rs. {test.rate.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                              {test.sample}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ display: 'flex', gap: '0.375rem' }}>
                                <button
                                  onClick={() => handleOpenTestModal(test)}
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '0.2rem' }}
                                  title="Edit Test Price / Details"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => deleteTest(test.id)}
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--error-red)', borderColor: '#fca5a5' }}
                                  title="Delete Test"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </Layout>

      {/* MODAL 1: ADD / EDIT TEST */}
      {isTestModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card fade-in"
            style={{ width: '100%', maxWidth: '520px', backgroundColor: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: '0 20px 45px -10px rgba(0, 56, 179, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0 }}>
                {editingTest ? 'Edit Test Details' : 'Add New Diagnostic Test'}
              </h3>
              <button onClick={() => setIsTestModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Test Code</label>
                  <input
                    type="text"
                    required
                    value={testForm.code}
                    onChange={(e) => setTestForm({ ...testForm, code: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={testForm.rate}
                    onChange={(e) => setTestForm({ ...testForm, rate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Test Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vitamin D3 25-OH Total"
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value as any })}
                  >
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Hormones">Hormones</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="PCR & Virology">PCR & Virology</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Turnaround Time</label>
                  <input
                    type="text"
                    value={testForm.reportingTime}
                    onChange={(e) => setTestForm({ ...testForm, reportingTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sample Requirement</label>
                <input
                  type="text"
                  placeholder="e.g. 3CC Serum Red Top"
                  value={testForm.sample}
                  onChange={(e) => setTestForm({ ...testForm, sample: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsTestModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE CASH RECEIPT & VOUCHER */}
      {isReceiptModalOpen && selectedReceiptBooking && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          <div
            className="card fade-in"
            style={{
              width: '100%',
              maxWidth: '660px',
              backgroundColor: '#fff',
              padding: '2.25rem',
              borderRadius: '24px',
              boxShadow: '0 20px 45px -10px rgba(0, 56, 179, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/logo.png" alt="Logo" style={{ height: '45px' }} />
                <div>
                  <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-blue)', margin: 0, fontWeight: 700 }}>
                    AFTAB CLINIC DIAGNOSTIC LABORATORY
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Official Patient Cash Receipt & Booking Voucher
                  </p>
                </div>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>
                <X size={18} />
              </button>
            </div>

            {/* Admin Discount Control Box (Percentage % - hidden during print) */}
            <div
              className="no-print"
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#e0f2fe',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #bae6fd',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-blue)', fontWeight: 600, fontSize: '0.8125rem' }}>
                  <Tag size={16} />
                  <span>Apply Concession / Discount Percentage (%):</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={receiptDiscountPercent || ''}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, Number(e.target.value)));
                      setReceiptDiscountPercent(val);
                      if (selectedReceiptBooking) {
                        updateBookingDiscount(selectedReceiptBooking.id, val);
                      }
                    }}
                    style={{
                      width: '75px',
                      padding: '0.3rem 0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #0284c7',
                      backgroundColor: '#ffffff',
                      textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary-blue)' }}>%</span>
                </div>
              </div>

              {/* Quick Preset Percentage Buttons */}
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Quick presets:</span>
                {[0, 5, 10, 15, 20, 25, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setReceiptDiscountPercent(pct);
                      if (selectedReceiptBooking) {
                        updateBookingDiscount(selectedReceiptBooking.id, pct);
                      }
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      border: receiptDiscountPercent === pct ? '1px solid var(--primary-blue)' : '1px solid #cbd5e1',
                      backgroundColor: receiptDiscountPercent === pct ? 'var(--primary-blue)' : '#ffffff',
                      color: receiptDiscountPercent === pct ? '#ffffff' : 'var(--text-body)',
                      cursor: 'pointer',
                    }}
                  >
                    {pct === 0 ? 'No Disc' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Receipt Content Body */}
            <div id="printable-receipt" style={{ border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '8px', backgroundColor: '#fafafa', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                <div>
                  <strong>Receipt No:</strong> REC-{selectedReceiptBooking.id}<br />
                  <strong>Date:</strong> {selectedReceiptBooking.date}<br />
                  <strong>Type:</strong> {selectedReceiptBooking.collectionType}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Status:</strong> <span style={{ color: 'var(--success-green)', fontWeight: 700 }}>PAID / CONFIRMED</span><br />
                  <strong>Lab Contact:</strong> {whatsAppConfig.displayPhone}
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '0.875rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div><strong>Patient Name:</strong> {selectedReceiptBooking.patientName}</div>
                  <div><strong>Phone:</strong> {selectedReceiptBooking.phoneNumber}</div>
                  <div><strong>Age / Gender:</strong> {selectedReceiptBooking.age}, {selectedReceiptBooking.gender}</div>
                  <div><strong>Time Slot:</strong> {selectedReceiptBooking.timeSlot || 'Standard'}</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', marginBottom: '1rem', backgroundColor: '#fff' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary-blue-light)', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Test / Package Name</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Rate (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceiptBooking.tests.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.5rem' }}>{idx + 1}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>[{t.code}] {t.name}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>Rs. {t.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(() => {
                const grossSubtotal = selectedReceiptBooking.tests.reduce((sum, t) => sum + t.price, 0);
                const currentPercent = receiptDiscountPercent;
                const calcDiscAmount = Math.round((grossSubtotal * currentPercent) / 100);
                const netPayable = Math.max(0, grossSubtotal - calcDiscAmount);
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px dashed #cbd5e1', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Thank you for choosing Aftab Clinic.<br />
                      *Official Computer Generated Cash Receipt.
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Gross Subtotal: <strong>Rs. {grossSubtotal.toLocaleString()}</strong>
                      </div>
                      {currentPercent > 0 && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--primary-green)', fontWeight: 600, margin: '0.15rem 0' }}>
                          Concession Discount ({currentPercent}%): <strong>- Rs. {calcDiscAmount.toLocaleString()}</strong>
                        </div>
                      )}
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginTop: '0.2rem' }}>
                        Net Paid Total: Rs. {netPayable.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsReceiptModalOpen(false)} className="btn btn-outline">
                Close
              </button>
              <button onClick={triggerWindowPrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={16} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: WALK-IN COUNTER BOOKING */}
      {isNewBookingModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card fade-in"
            style={{ width: '100%', maxWidth: '520px', backgroundColor: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: '0 20px 45px -10px rgba(0, 56, 179, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0 }}>
                Walk-In / Counter Booking
              </h3>
              <button onClick={() => setIsNewBookingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBooking}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={newBookingForm.patientName}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, patientName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={newBookingForm.phoneNumber}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Age & Gender</label>
                  <input
                    type="text"
                    placeholder="35 Yrs, Male"
                    value={newBookingForm.age}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tests / Package Description</label>
                <input
                  type="text"
                  placeholder="e.g. CBC + Lipid Profile"
                  value={newBookingForm.testCodesInput}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, testCodesInput: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Amount Charged (PKR)</label>
                <input
                  type="number"
                  required
                  value={newBookingForm.totalAmount}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, totalAmount: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsNewBookingModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Booking & Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PUBLISH DIGITAL LAB REPORT */}
      {isReportModalOpen && selectedReportBooking && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card fade-in"
            style={{ width: '100%', maxWidth: '580px', backgroundColor: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: '0 20px 45px -10px rgba(0, 56, 179, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0 }}>
                Publish Digital Report for {selectedReportBooking.patientName}
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublishReport}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Report Title</label>
                <input
                  type="text"
                  value={reportForm.testName}
                  onChange={(e) => setReportForm({ ...reportForm, testName: e.target.value })}
                />
              </div>

              <div style={{ border: '1px solid var(--border-light)', padding: '0.875rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: 'var(--bg-slate)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'var(--primary-blue)' }}>
                  Parameter Finding #1
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Param Name"
                    value={reportForm.parameter1Name}
                    onChange={(e) => setReportForm({ ...reportForm, parameter1Name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={reportForm.parameter1Val}
                    onChange={(e) => setReportForm({ ...reportForm, parameter1Val: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Ref Range"
                    value={reportForm.parameter1Ref}
                    onChange={(e) => setReportForm({ ...reportForm, parameter1Ref: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-light)', padding: '0.875rem', borderRadius: '6px', marginBottom: '1.25rem', backgroundColor: 'var(--bg-slate)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'var(--primary-blue)' }}>
                  Parameter Finding #2
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Param Name"
                    value={reportForm.parameter2Name}
                    onChange={(e) => setReportForm({ ...reportForm, parameter2Name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={reportForm.parameter2Val}
                    onChange={(e) => setReportForm({ ...reportForm, parameter2Val: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Ref Range"
                    value={reportForm.parameter2Ref}
                    onChange={(e) => setReportForm({ ...reportForm, parameter2Ref: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsReportModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Lab Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
