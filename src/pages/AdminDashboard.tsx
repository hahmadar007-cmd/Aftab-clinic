import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
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
  ShieldCheck,
  Tag,
  MessageCircle,
  Save,
  Upload,
  Eye,
  AlertTriangle,
  RefreshCw,
  Lock,
  Download,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLabData } from '../context/LabDataContext';
import { useAuth } from '../context/AuthContext';
import type { BookingRecord, LabReportRecord } from '../context/LabDataContext';
import type { LabTest } from '../data/labData';
import { sanitizeNameInput, sanitizePhoneInput, sanitizeDigitsOnly } from '../utils/validation';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { createAuthorizedBlobUrl } from '../utils/reportSecurity';

export const AdminDashboard: React.FC = () => {
  const {
    tests,
    bookings,
    reports,
    addTest,
    updateTest,
    deleteTest,
    addBooking,
    updateBookingStatus,
    updateBookingDiscount,
    deleteBooking,
    addReport,
    uploadAndDeliverReport,
    getPrivateReportPDF,
  } = useLabData();

  const {
    whatsAppConfig,
    updateWhatsAppConfig,
    getAllRegisteredAccounts,
    user: currentUser,
    adminsList,
    grantAdminRole,
    revokeAdminRole,
  } = useAuth();
  const [waPhoneDisplay, setWaPhoneDisplay] = useState(whatsAppConfig.displayPhone);
  const [waPhoneDigits, setWaPhoneDigits] = useState(whatsAppConfig.phoneNumber);
  const [waSaveMsg, setWaSaveMsg] = useState(false);

  // Administrator Privileges Delegation State
  const [newAdminInput, setNewAdminInput] = useState('');
  const [adminActionMsg, setAdminActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isGrantingAdmin, setIsGrantingAdmin] = useState(false);

  // Main Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'patients' | 'reports' | 'tests'>('overview');

  // Search & Filter state
  const [bookingFilter, setBookingFilter] = useState<
    'All' | 'Awaiting Reports' | 'Pending' | 'Sample Collected' | 'In Process' | 'Completed' | 'Cancelled'
  >('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<'All' | 'ready' | 'replaced'>('All');
  const [testSearch, setTestSearch] = useState('');

  // Modals state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<BookingRecord | null>(null);
  const [receiptDiscountPercent, setReceiptDiscountPercent] = useState<number>(0);

  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportBooking, setSelectedReportBooking] = useState<BookingRecord | null>(null);

  // ----------------------------------------------------
  // "UPLOAD REPORT" MODAL STATE
  // ----------------------------------------------------
  const [isUploadReportModalOpen, setIsUploadReportModalOpen] = useState(false);
  const [targetBookingForUpload, setTargetBookingForUpload] = useState<BookingRecord | null>(null);
  const [selectedTestNamesForReport, setSelectedTestNamesForReport] = useState<string[]>([]);
  const [selectedPDFFile, setSelectedPDFFile] = useState<File | null>(null);
  const [selectedPDFDataUrl, setSelectedPDFDataUrl] = useState<string>('');
  const [pdfUploadError, setPdfUploadError] = useState<string>('');
  const [patientConfirmed, setPatientConfirmed] = useState(false);
  const [isReplacingReport, setIsReplacingReport] = useState(false);
  const [replacementConfirmed, setReplacementConfirmed] = useState(false);
  const [replacementReason, setReplacementReason] = useState('');
  const [existingReportToReplace, setExistingReportToReplace] = useState<LabReportRecord | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState<{ title: string; detail: string } | null>(null);

  // ----------------------------------------------------
  // ADMIN REPORT PREVIEW MODAL STATE
  // ----------------------------------------------------
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewReportRecord, setPreviewReportRecord] = useState<LabReportRecord | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewRevokeFn, setPreviewRevokeFn] = useState<(() => void) | null>(null);

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

  // Dynamic Report Form Parameter Row (Manual editor)
  interface ReportParamRow {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'Normal' | 'High' | 'Low';
  }

  const [reportForm, setReportForm] = useState<{
    testName: string;
    pathologistName: string;
    statusUpdate: BookingRecord['status'];
    parameters: ReportParamRow[];
  }>({
    testName: '',
    pathologistName: 'Dr. S. A. Aftab (Consultant Pathologist, FCPS)',
    statusUpdate: 'Completed',
    parameters: [],
  });

  // Calculate Statistics
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const inProcessCount = bookings.filter((b) => b.status === 'In Process' || b.status === 'Sample Collected').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed').length;
  const awaitingReportsCount = bookings.filter((b) => {
    if (b.status === 'Completed' || b.status === 'Cancelled') return false;
    return b.tests.some((t) => t.reportStatus !== 'ready');
  }).length;
  const totalRevenue = bookings.reduce((sum, b) => (b.paymentStatus === 'Paid' ? sum + b.totalAmount : sum), 0);

  // ----------------------------------------------------
  // "UPLOAD REPORT" ACTION HANDLERS
  // ----------------------------------------------------
  const handleOpenUploadReportModal = (booking: BookingRecord, initialTestName?: string) => {
    setTargetBookingForUpload(booking);
    setPdfUploadError('');
    setSelectedPDFFile(null);
    setSelectedPDFDataUrl('');
    setPatientConfirmed(false);
    setReplacementConfirmed(false);
    setReplacementReason('');
    setUploadSuccessAlert(null);

    // Initial test selection: either the specific clicked test, or all tests in the booking
    if (initialTestName) {
      setSelectedTestNamesForReport([initialTestName]);
    } else {
      setSelectedTestNamesForReport(booking.tests.map((t) => t.name));
    }

    // Check if any report already exists for this booking or selected test
    const existing = reports.find(
      (r) =>
        r.bookingId === booking.id &&
        r.status === 'ready' &&
        (!initialTestName || r.testNames?.includes(initialTestName) || r.testName.includes(initialTestName))
    );

    if (existing) {
      setIsReplacingReport(true);
      setExistingReportToReplace(existing);
    } else {
      setIsReplacingReport(false);
      setExistingReportToReplace(null);
    }

    setIsUploadReportModalOpen(true);
  };

  const handleTestSelectionChange = (testName: string) => {
    let updated: string[];
    if (selectedTestNamesForReport.includes(testName)) {
      updated = selectedTestNamesForReport.filter((t) => t !== testName);
    } else {
      updated = [...selectedTestNamesForReport, testName];
    }
    setSelectedTestNamesForReport(updated);

    // Re-check replacement status for newly selected tests
    if (targetBookingForUpload) {
      const existing = reports.find(
        (r) =>
          r.bookingId === targetBookingForUpload.id &&
          r.status === 'ready' &&
          updated.some((name) => r.testNames?.includes(name) || r.testName.includes(name))
      );
      if (existing) {
        setIsReplacingReport(true);
        setExistingReportToReplace(existing);
      } else {
        setIsReplacingReport(false);
        setExistingReportToReplace(null);
      }
    }
  };

  const handleSelectAllTests = () => {
    if (!targetBookingForUpload) return;
    const all = targetBookingForUpload.tests.map((t) => t.name);
    setSelectedTestNamesForReport(all);

    const existing = reports.find((r) => r.bookingId === targetBookingForUpload.id && r.status === 'ready');
    if (existing) {
      setIsReplacingReport(true);
      setExistingReportToReplace(existing);
    } else {
      setIsReplacingReport(false);
      setExistingReportToReplace(null);
    }
  };

  const handlePDFFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // File type validation (must be PDF)
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfUploadError('Invalid document format. Only official PDF medical reports (.pdf) are permitted.');
      setSelectedPDFFile(null);
      setSelectedPDFDataUrl('');
      return;
    }

    // Size validation (Max 15MB)
    const maxSizeBytes = 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setPdfUploadError('File size exceeds the 15 MB threshold. Please compress or optimize the PDF before uploading.');
      setSelectedPDFFile(null);
      setSelectedPDFDataUrl('');
      return;
    }

    setSelectedPDFFile(file);

    // Read file as Data URL for in-modal preview & private storage
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedPDFDataUrl(reader.result as string);
    };
    reader.onerror = () => {
      setPdfUploadError('Failed to read the PDF file. Please try again or re-select the file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSendReportToPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBookingForUpload || !selectedPDFFile || !selectedPDFDataUrl) return;

    if (selectedTestNamesForReport.length === 0) {
      setPdfUploadError('Please select at least one test that this PDF report corresponds to.');
      return;
    }

    if (!patientConfirmed) {
      setPdfUploadError('Please confirm that this document matches the patient name and booking reference.');
      return;
    }

    if (isReplacingReport && !replacementConfirmed) {
      setPdfUploadError('Please confirm report replacement by checking the confirmation box.');
      return;
    }

    setIsUploading(true);
    setPdfUploadError('');

    try {
      const result = await uploadAndDeliverReport({
        bookingId: targetBookingForUpload.id,
        testNames: selectedTestNamesForReport,
        file: selectedPDFFile,
        fileDataUrl: selectedPDFDataUrl,
        uploadedBy: currentUser?.fullName || 'Administrator (FCPS Pathologist)',
        replaceExisting: isReplacingReport,
        replacementReason: replacementReason || 'Updated report uploaded by Administrator',
        existingReportIdToReplace: existingReportToReplace?.reportId,
      });

      if (result.success && result.reportId) {
        setUploadSuccessAlert({
          title: `Report ${result.reportId} Published & Delivered Successfully!`,
          detail: `The PDF result is now ready in ${targetBookingForUpload.patientName}'s patient portal. An in-app notification was sent.`,
        });
        setTimeout(() => {
          setIsUploadReportModalOpen(false);
          setUploadSuccessAlert(null);
        }, 2200);
      } else {
        setPdfUploadError(result.error || 'Failed to publish and deliver report.');
      }
    } catch (err: any) {
      setPdfUploadError(err.message || 'An error occurred during report upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // ----------------------------------------------------
  // ADMIN REPORT PREVIEW & DOWNLOAD HANDLER
  // ----------------------------------------------------
  const handleOpenAdminPreview = async (report: LabReportRecord) => {
    setPreviewReportRecord(report);
    if (previewRevokeFn) previewRevokeFn();
    setPreviewBlobUrl(null);

    if (report.hasPDF) {
      const dataUrl = await getPrivateReportPDF(report.reportId);
      if (dataUrl) {
        const { blobUrl, revoke } = createAuthorizedBlobUrl(dataUrl);
        setPreviewBlobUrl(blobUrl);
        setPreviewRevokeFn(() => revoke);
      }
    }
    setPreviewModalOpen(true);
  };

  const handleCloseAdminPreview = () => {
    if (previewRevokeFn) previewRevokeFn();
    setPreviewBlobUrl(null);
    setPreviewRevokeFn(null);
    setPreviewModalOpen(false);
  };

  // ----------------------------------------------------
  // TEST CATALOG CRUD HANDLERS
  // ----------------------------------------------------
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
        { code: 'AC-TEST', name: newBookingForm.testCodesInput || 'Diagnostic Screening', price: Number(newBookingForm.totalAmount), reportStatus: 'pending' },
      ],
      totalAmount: Number(newBookingForm.totalAmount),
    });
    setIsNewBookingModalOpen(false);
  };

  // Manual Parameter Report Creation
  const handleOpenManualReportModal = (booking: BookingRecord) => {
    setSelectedReportBooking(booking);
    const testNamesTitle = booking.tests.map((t) => t.name).join(' + ') || 'Diagnostic Testing Report';

    setReportForm({
      testName: testNamesTitle,
      pathologistName: 'Dr. S. A. Aftab (Consultant Pathologist, FCPS)',
      statusUpdate: 'Completed',
      parameters: [{ parameter: '', value: '', unit: '', referenceRange: '', status: 'Normal' }],
    });
    setIsReportModalOpen(true);
  };

  const handlePublishManualReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportBooking) return;

    addReport({
      bookingId: selectedReportBooking.id,
      patientName: selectedReportBooking.patientName,
      patientAge: selectedReportBooking.age,
      patientGender: selectedReportBooking.gender,
      patientPhone: selectedReportBooking.phoneNumber,
      date: new Date().toISOString().split('T')[0],
      testName: reportForm.testName,
      testsList: selectedReportBooking.tests,
      results: reportForm.parameters,
      pathologist: reportForm.pathologistName,
      uploadedBy: currentUser?.fullName || 'Administrator',
      publishedBy: currentUser?.fullName || 'Administrator',
    });

    updateBookingStatus(selectedReportBooking.id, reportForm.statusUpdate, 'Paid');
    setIsReportModalOpen(false);
    alert(`Manual Lab Report for ${selectedReportBooking.patientName} published successfully!`);
  };

  // ----------------------------------------------------
  // FILTERED DATASETS
  // ----------------------------------------------------
  const filteredBookingsList = bookings.filter((b) => {
    // Status filter
    if (bookingFilter === 'Awaiting Reports') {
      if (b.status === 'Completed' || b.status === 'Cancelled') return false;
      const hasPending = b.tests.some((t) => t.reportStatus !== 'ready');
      if (!hasPending) return false;
    } else if (bookingFilter !== 'All') {
      if (b.status !== bookingFilter) return false;
    }

    // Search query
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const matchId = b.id.toLowerCase().includes(q);
      const matchName = b.patientName.toLowerCase().includes(q);
      const matchPhone = b.phoneNumber.toLowerCase().includes(q);
      const matchTest = b.tests.some((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
      if (!matchId && !matchName && !matchPhone && !matchTest) return false;
    }

    return true;
  });

  // Aggregated Patients Directory
  const registeredAccounts = getAllRegisteredAccounts();
  const allPatientsMap = new Map<string, { id: string; name: string; contact: string; bookingsCount: number; reportsCount: number }>();

  registeredAccounts.forEach((acc) => {
    allPatientsMap.set(acc.id, {
      id: acc.id,
      name: acc.fullName,
      contact: acc.emailOrPhone,
      bookingsCount: 0,
      reportsCount: 0,
    });
  });

  bookings.forEach((b) => {
    const key = b.userId || b.phoneNumber;
    if (allPatientsMap.has(key)) {
      const p = allPatientsMap.get(key)!;
      p.bookingsCount += 1;
    } else {
      allPatientsMap.set(key, {
        id: b.userId || `walkin_${b.id}`,
        name: b.patientName,
        contact: b.phoneNumber,
        bookingsCount: 1,
        reportsCount: 0,
      });
    }
  });

  reports.forEach((r) => {
    const key = r.userId || r.patientPhone || '';
    if (allPatientsMap.has(key)) {
      allPatientsMap.get(key)!.reportsCount += 1;
    }
  });

  const allPatientsList = Array.from(allPatientsMap.values()).filter((p) => {
    if (!patientSearch.trim()) return true;
    const q = patientSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.contact.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminInput.trim()) return;
    setIsGrantingAdmin(true);
    setAdminActionMsg(null);
    const res = await grantAdminRole(newAdminInput.trim());
    if (res.success) {
      setAdminActionMsg({ type: 'success', text: `Successfully granted Administrator privileges to "${newAdminInput.trim()}".` });
      setNewAdminInput('');
    } else {
      setAdminActionMsg({ type: 'error', text: res.error || 'Failed to grant admin privileges.' });
    }
    setIsGrantingAdmin(false);
  };

  const handleRevokeAdmin = async (docId: string, identifier: string) => {
    if (!window.confirm(`Revoke administrator privileges for "${identifier}"?`)) return;
    setAdminActionMsg(null);
    const res = await revokeAdminRole(docId);
    if (res.success) {
      setAdminActionMsg({ type: 'success', text: `Revoked Administrator privileges for "${identifier}".` });
    } else {
      setAdminActionMsg({ type: 'error', text: res.error || 'Failed to revoke privileges.' });
    }
  };

  // Filtered Reports Archive
  const filteredReportsList = reports.filter((r) => {
    if (reportStatusFilter !== 'All' && r.status !== reportStatusFilter) return false;
    if (reportSearch.trim()) {
      const q = reportSearch.toLowerCase();
      const matchId = r.reportId.toLowerCase().includes(q);
      const matchBooking = r.bookingId.toLowerCase().includes(q);
      const matchPatient = r.patientName.toLowerCase().includes(q);
      const matchTest = r.testName.toLowerCase().includes(q);
      if (!matchId && !matchBooking && !matchPatient && !matchTest) return false;
    }
    return true;
  });

  const filteredTestsList = tests.filter(
    (t) =>
      t.name.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.code.includes(testSearch) ||
      t.category.toLowerCase().includes(testSearch.toLowerCase())
  );

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
                    Aftab Clinic Diagnostic Admin Center
                  </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                  Logged in as Administrator (Upload & Deliver PDF Reports, Manage Bookings, Patients, and Test Catalog)
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

            {/* Clean Admin Navigation Tab Bar */}
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
                📊 Overview
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                📋 Bookings & Cash Receipts ({bookings.length})
                {awaitingReportsCount > 0 && (
                  <span style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.6875rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                    {awaitingReportsCount} awaiting
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('patients')}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'patients' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'patients' ? '3px solid var(--primary-blue)' : '3px solid transparent',
                  marginBottom: '-0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                👥 Patients Directory ({allPatientsList.length})
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'reports' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'reports' ? '3px solid var(--primary-blue)' : '3px solid transparent',
                  marginBottom: '-0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                📄 Delivered Reports ({reports.length})
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
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Awaiting Reports</span>
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#b45309' }}>
                      {awaitingReportsCount}
                    </div>
                  </div>

                  <div className="card" style={{ borderTop: '4px solid var(--primary-green)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <CheckCircle size={22} color="var(--primary-green)" />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Delivered Reports</span>
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {reports.length}
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
              </div>
            )}

            {/* TAB 2: BOOKINGS & CASH RECEIPTS */}
            {activeTab === 'bookings' && (
              <div>
                {/* Search & Quick Filter Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0 }}>
                      Patient Bookings
                    </h2>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { label: 'All', value: 'All', count: bookings.length },
                        { label: '⚠️ Awaiting Reports', value: 'Awaiting Reports', count: awaitingReportsCount, highlight: true },
                        { label: 'Pending', value: 'Pending', count: pendingCount },
                        { label: 'In Process', value: 'In Process', count: inProcessCount },
                        { label: 'Completed', value: 'Completed', count: completedCount },
                      ].map((chip) => (
                        <button
                          key={chip.value}
                          onClick={() => setBookingFilter(chip.value as any)}
                          style={{
                            padding: '0.3rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-full)',
                            border: bookingFilter === chip.value ? '1px solid var(--primary-blue)' : '1px solid var(--border-light)',
                            backgroundColor: bookingFilter === chip.value ? 'var(--primary-blue)' : chip.highlight && chip.count > 0 ? '#fef3c7' : '#ffffff',
                            color: bookingFilter === chip.value ? '#ffffff' : chip.highlight && chip.count > 0 ? '#b45309' : 'var(--text-dark)',
                            cursor: 'pointer',
                          }}
                        >
                          {chip.label} ({chip.count})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div className="input-wrapper" style={{ minWidth: '220px' }}>
                      <Search size={16} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Search patient, ref, phone..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        style={{ padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <button onClick={() => setIsNewBookingModalOpen(true)} className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
                      <Plus size={16} /> New Booking
                    </button>
                  </div>
                </div>

                <div className="card" style={{ padding: '0.5rem' }}>
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-light)', backgroundColor: 'var(--bg-slate)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Ref ID</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Patient Details & Age</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Date & Slot</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Tests & Report Status</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total (PKR)</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookingsList.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                              No bookings found matching current filters.
                            </td>
                          </tr>
                        ) : (
                          filteredBookingsList.map((booking) => (
                            <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                                {booking.id}
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{booking.patientName}</div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-blue)', marginTop: '0.15rem' }}>
                                  Age: {booking.age ? `${booking.age}` : 'N/A'} ({booking.gender || 'Patient'})
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  📞 {booking.phoneNumber}
                                </div>
                              </td>
                              <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>
                                <div style={{ fontWeight: 600 }}>{booking.date}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', fontWeight: 600, backgroundColor: 'var(--primary-blue-light)', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.25rem' }}>
                                  ⏰ {booking.timeSlot || 'Morning (08:00 AM - 12:00 PM)'}
                                </div>
                              </td>
                              <td style={{ padding: '0.75rem', fontSize: '0.8125rem', maxWidth: '280px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  {booking.tests.map((t, idx) => {
                                    const isReady = t.reportStatus === 'ready';
                                    return (
                                      <div
                                        key={idx}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: '0.35rem',
                                          padding: '0.2rem 0.4rem',
                                          backgroundColor: isReady ? '#f0fdf4' : '#fffbeb',
                                          borderRadius: '4px',
                                          border: isReady ? '1px solid #bbf7d0' : '1px solid #fef3c7',
                                        }}
                                      >
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                                          [{t.code}] {t.name}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: '0.6875rem',
                                            fontWeight: 700,
                                            padding: '0.1rem 0.35rem',
                                            borderRadius: 'var(--radius-full)',
                                            backgroundColor: isReady ? '#dcfce7' : '#fef3c7',
                                            color: isReady ? '#15803d' : '#b45309',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {isReady ? '✓ Report Ready' : '⏳ Pending'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-green)' }}>
                                Rs. {booking.totalAmount.toLocaleString()}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                  ({booking.paymentStatus})
                                </div>
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
                                        ? '#dcfce7'
                                        : booking.status === 'Partially Ready'
                                        ? '#ffedd5'
                                        : booking.status === 'In Process'
                                        ? '#e0e7ff'
                                        : booking.status === 'Confirmed'
                                        ? 'var(--primary-blue-light)'
                                        : '#fef3c7',
                                    color:
                                      booking.status === 'Completed'
                                        ? '#15803d'
                                        : booking.status === 'Partially Ready'
                                        ? '#c2410c'
                                        : booking.status === 'In Process'
                                        ? '#3730a3'
                                        : booking.status === 'Confirmed'
                                        ? 'var(--primary-blue)'
                                        : '#b45309',
                                    border: 'none',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Sample Collected">Sample Collected</option>
                                  <option value="In Process">In Process</option>
                                  <option value="Partially Ready">Partially Ready</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                  {/* UPLOAD REPORT ACTION */}
                                  <button
                                    onClick={() => handleOpenUploadReportModal(booking)}
                                    className="btn btn-primary"
                                    style={{
                                      padding: '0.3rem 0.6rem',
                                      fontSize: '0.75rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      backgroundColor: '#0284c7',
                                    }}
                                    title="Upload & Deliver PDF Report"
                                  >
                                    <Upload size={14} /> Upload Report
                                  </button>

                                  <button
                                    onClick={() => handlePrintReceipt(booking)}
                                    className="btn btn-outline"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    title="Print Official Cash Receipt"
                                  >
                                    <Printer size={14} /> Receipt
                                  </button>

                                  <button
                                    onClick={() => handleOpenManualReportModal(booking)}
                                    className="btn btn-outline"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    title="Open Manual Parameter Editor"
                                  >
                                    <FileText size={14} /> Editor
                                  </button>

                                  <a
                                    href={getWhatsAppUrl(
                                      booking.phoneNumber,
                                      `Hello ${booking.patientName}, regarding your Aftab Clinic Lab Booking (Ref: ${booking.id}) for ${booking.tests.map(t => t.name).join(', ')}. Status: ${booking.status}. Amount: Rs. ${booking.totalAmount}. Track report: ${window.location.origin}/reports`
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-whatsapp"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fff', textDecoration: 'none' }}
                                    title="Send WhatsApp Message"
                                  >
                                    <MessageCircle size={14} /> WhatsApp
                                  </a>

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
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PATIENTS DIRECTORY */}
            {activeTab === 'patients' && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0 }}>
                      Patient Directory & Accounts
                    </h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                      Verified patient accounts and associated clinical booking records
                    </p>
                  </div>

                  <div className="input-wrapper" style={{ minWidth: '240px' }}>
                    <Search size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Search patient name, phone, email..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      style={{ padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                {/* Administrator Privileges Management Card */}
                <div
                  className="card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderLeft: '4px solid var(--primary-blue)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={20} color="var(--primary-blue)" />
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-blue)' }}>
                      Staff & Administrator Privileges Management
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                    Authorized administrators can grant or revoke admin dashboard and PDF publishing privileges to any mobile phone number or email address.
                  </p>

                  {adminActionMsg && (
                    <div
                      style={{
                        padding: '0.625rem 0.875rem',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        marginBottom: '1rem',
                        backgroundColor: adminActionMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: adminActionMsg.type === 'success' ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {adminActionMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleGrantAdmin} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Enter mobile number (e.g. 03001234567) or email..."
                      value={newAdminInput}
                      onChange={(e) => setNewAdminInput(e.target.value)}
                      style={{ flex: 1, minWidth: '220px', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                    />
                    <button
                      type="submit"
                      disabled={isGrantingAdmin || !newAdminInput.trim()}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                    >
                      {isGrantingAdmin ? 'Granting...' : '+ Grant Admin Access'}
                    </button>
                  </form>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Current Authorized Administrators ({adminsList.length}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {adminsList.map((adm) => {
                        const isRoot = adm.identifier === '03703513251' || adm.email.includes('03703513251');
                        return (
                          <div
                            key={adm.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.35rem 0.65rem',
                              backgroundColor: isRoot ? '#eff6ff' : '#f8fafc',
                              border: `1px solid ${isRoot ? '#bfdbfe' : 'var(--border-light)'}`,
                              borderRadius: '6px',
                              fontSize: '0.8125rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: isRoot ? 'var(--primary-blue)' : 'var(--text-dark)' }}>
                              {adm.identifier}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: isRoot ? 'var(--primary-blue)' : 'var(--text-muted)' }}>
                              {isRoot ? '(Primary Owner)' : `(Added by ${adm.grantedBy})`}
                            </span>
                            {!isRoot && (
                              <button
                                onClick={() => handleRevokeAdmin(adm.id, adm.identifier)}
                                style={{ background: 'none', border: 'none', color: 'var(--error-red)', cursor: 'pointer', fontSize: '0.75rem', padding: '0 0.2rem' }}
                                title="Revoke Admin Access"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '0.5rem' }}>
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-light)', backgroundColor: 'var(--bg-slate)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Patient Name</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Contact Identifier</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Patient ID</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Bookings</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Delivered Reports</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPatientsList.map((patient) => (
                          <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 700, fontSize: '0.875rem' }}>
                              {patient.name}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-dark)' }}>
                              {patient.contact}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <span style={{ backgroundColor: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                {patient.id}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                              {patient.bookingsCount} Order(s)
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: patient.reportsCount > 0 ? 'var(--primary-green)' : 'var(--text-muted)' }}>
                              {patient.reportsCount} Report(s)
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => {
                                    setBookingSearch(patient.name);
                                    setActiveTab('bookings');
                                  }}
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  View Bookings
                                </button>
                                <button
                                  onClick={() => {
                                    setReportSearch(patient.name);
                                    setActiveTab('reports');
                                  }}
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  View Reports
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

            {/* TAB 4: DELIVERED REPORTS & AUDIT TRAIL */}
            {activeTab === 'reports' && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0 }}>
                      Delivered Diagnostic Reports Archive
                    </h2>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {(['All', 'ready', 'replaced'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setReportStatusFilter(st)}
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-full)',
                            border: reportStatusFilter === st ? '1px solid var(--primary-blue)' : '1px solid var(--border-light)',
                            backgroundColor: reportStatusFilter === st ? 'var(--primary-blue)' : '#ffffff',
                            color: reportStatusFilter === st ? '#ffffff' : 'var(--text-dark)',
                            cursor: 'pointer',
                          }}
                        >
                          {st === 'All' ? 'All Reports' : st === 'ready' ? 'Active / Ready' : 'Replaced'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="input-wrapper" style={{ minWidth: '240px' }}>
                    <Search size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Search report ID, booking ref, patient..."
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      style={{ padding: '0.4rem 0.75rem 0.4rem 2.25rem', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div className="card" style={{ padding: '0.5rem' }}>
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-light)', backgroundColor: 'var(--bg-slate)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Report ID</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Booking Ref</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Patient Details</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Investigations Covered</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Audit Trail & Publication</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReportsList.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                              No diagnostic reports delivered yet. Use "Upload Report" on a booking to deliver a PDF report.
                            </td>
                          </tr>
                        ) : (
                          filteredReportsList.map((rep) => (
                            <tr key={rep.reportId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                                {rep.reportId}
                              </td>
                              <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                                {rep.bookingId}
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{rep.patientName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {rep.patientPhone}</div>
                              </td>
                              <td style={{ padding: '0.75rem', fontSize: '0.8125rem', maxWidth: '240px' }}>
                                <div style={{ fontWeight: 600 }}>{rep.testName}</div>
                                {rep.hasPDF && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', marginTop: '0.2rem' }}>
                                    📎 {rep.fileName || 'Report.pdf'} ({rep.fileSizeFormatted})
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <div><strong>Published By:</strong> {rep.publishedBy || rep.uploadedBy}</div>
                                <div><strong>When:</strong> {new Date(rep.publishedAt || rep.date).toLocaleString()}</div>
                                {rep.isReplacement && (
                                  <div style={{ color: '#b45309', fontWeight: 600, marginTop: '0.2rem' }}>
                                    Replaces: {rep.replacedReportId} ({rep.replacementReason})
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: rep.status === 'ready' ? '#dcfce7' : '#fee2e2',
                                    color: rep.status === 'ready' ? '#15803d' : '#b91c1c',
                                  }}
                                >
                                  {rep.status === 'ready' ? '✅ Ready' : 'Replaced'}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => handleOpenAdminPreview(rep)}
                                    className="btn btn-primary"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    title="Preview Authenticated PDF"
                                  >
                                    <Eye size={13} /> Preview
                                  </button>

                                  {/* Replace Action directly on report */}
                                  {(() => {
                                    const associatedBooking = bookings.find((b) => b.id === rep.bookingId);
                                    if (associatedBooking) {
                                      return (
                                        <button
                                          onClick={() => handleOpenUploadReportModal(associatedBooking, rep.testNames?.[0])}
                                          className="btn btn-outline"
                                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                          title="Replace with updated PDF"
                                        >
                                          <RefreshCw size={13} /> Replace
                                        </button>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TEST CATALOG CRUD */}
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

      {/* ==================================================== */}
      {/* MODAL: UPLOAD & DELIVER PDF REPORT                   */}
      {/* ==================================================== */}
      {isUploadReportModalOpen && targetBookingForUpload && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
              maxWidth: '680px',
              maxHeight: '92vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              padding: '1.75rem',
              borderRadius: '24px',
              boxShadow: '0 20px 45px -10px rgba(0, 56, 179, 0.2)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={22} color="var(--primary-blue)" />
                  Upload & Deliver PDF Report
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Securely deliver official verified PDF test result to the patient's authenticated portal.
                </p>
              </div>
              <button
                onClick={() => setIsUploadReportModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Success Alert Banner */}
            {uploadSuccessAlert && (
              <div
                style={{
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  color: '#166534',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{uploadSuccessAlert.title}</div>
                <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>{uploadSuccessAlert.detail}</div>
              </div>
            )}

            {/* Error Banner */}
            {pdfUploadError && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  color: '#991b1b',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle size={16} />
                <span>{pdfUploadError}</span>
              </div>
            )}

            <form onSubmit={handleSendReportToPatient}>
              {/* Step 1: Patient & Booking Context Card */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Patient & Booking Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Patient Name</span>
                    <strong style={{ color: 'var(--primary-blue)' }}>{targetBookingForUpload.patientName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Booking Reference</span>
                    <strong style={{ backgroundColor: 'var(--primary-blue-light)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                      {targetBookingForUpload.id}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Phone Number</span>
                    <strong>{targetBookingForUpload.phoneNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Age / Gender</span>
                    <strong>{targetBookingForUpload.age} / {targetBookingForUpload.gender}</strong>
                  </div>
                </div>
              </div>

              {/* Step 2: Ordered Tests Selection (Multi-test support) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                    Select Tests Covered by this PDF ({selectedTestNamesForReport.length}/{targetBookingForUpload.tests.length}):
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllTests}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Select All Tests
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {targetBookingForUpload.tests.map((test, idx) => {
                    const isChecked = selectedTestNamesForReport.includes(test.name);
                    const isAlreadyReady = test.reportStatus === 'ready';

                    return (
                      <label
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: isChecked ? '1px solid var(--primary-blue)' : '1px solid var(--border-light)',
                          backgroundColor: isChecked ? 'var(--primary-blue-light)' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTestSelectionChange(test.name)}
                          />
                          <span style={{ fontWeight: 600 }}>[{test.code}] {test.name}</span>
                        </div>

                        <div>
                          {isAlreadyReady && (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                              ⚠️ Report Delivered (Will Replace)
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                  *For bookings with multiple tests, delivering an individual report marks that test ready without closing the entire booking while other results are pending.
                </span>
              </div>

              {/* Step 3: File Upload Input with Type & Size Validation */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-dark)', display: 'block', marginBottom: '0.35rem' }}>
                  Select PDF Result File (.pdf only, max 15 MB)
                </label>

                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('report-pdf-file-input')?.click()}
                >
                  <input
                    id="report-pdf-file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handlePDFFileSelected}
                  />

                  {selectedPDFFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <FileText size={28} color="var(--primary-green)" />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-dark)' }}>
                          {selectedPDFFile.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Size: {Math.round(selectedPDFFile.size / 1024)} KB • Format: PDF Validated ✓
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} color="var(--primary-blue)" style={{ margin: '0 auto 0.5rem auto', opacity: 0.8 }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                        Click to browse or drag and drop signed PDF report
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Only official PDF format is accepted. File size up to 15 MB.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: In-Modal PDF Preview */}
              {selectedPDFDataUrl && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Eye size={15} color="var(--primary-blue)" />
                    Document Preview (Verify patient & tests before delivery)
                  </div>
                  <div style={{ height: '300px', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#525659' }}>
                    <iframe
                      src={`${selectedPDFDataUrl}#toolbar=0`}
                      title="Report PDF Preview"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Explicit Confirmations */}
              <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                  <input
                    type="checkbox"
                    checked={patientConfirmed}
                    onChange={(e) => setPatientConfirmed(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <span>
                    I confirm that this PDF report matches patient <strong>{targetBookingForUpload.patientName}</strong> for booking reference <strong>{targetBookingForUpload.id}</strong>.
                  </span>
                </label>
              </div>

              {/* Step 6: Replacement Handling (If replacing an existing report) */}
              {isReplacingReport && (
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem 1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                    <AlertTriangle size={16} />
                    <span>Report Replacement Notice:</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#92400e', margin: '0 0 0.5rem 0' }}>
                    A report for this test is already delivered in the patient's account (ID: {existingReportToReplace?.reportId || 'Existing'}). Uploading this file will archive the previous report and deliver the revision to the patient.
                  </p>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, color: '#92400e', marginBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={replacementConfirmed}
                      onChange={(e) => setReplacementConfirmed(e.target.checked)}
                    />
                    <span>I explicitly confirm replacing the previous report with this updated PDF.</span>
                  </label>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e', display: 'block', marginBottom: '0.2rem' }}>
                      Reason for Replacement:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Recalibrated test result / typo correction..."
                      value={replacementReason}
                      onChange={(e) => setReplacementReason(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #fde68a' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 7: "Send to Patient" Action Button */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={!selectedPDFFile || !patientConfirmed || (isReplacingReport && !replacementConfirmed) || isUploading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: !selectedPDFFile || !patientConfirmed || (isReplacingReport && !replacementConfirmed) || isUploading ? 0.6 : 1,
                    cursor: !selectedPDFFile || !patientConfirmed || (isReplacingReport && !replacementConfirmed) || isUploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isUploading ? (
                    <>
                      <Clock size={18} style={{ animation: 'spin 1s infinite linear' }} />
                      <span>Encrypting & Delivering to Patient Portal...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>Send to Patient</span>
                    </>
                  )}
                </button>

                {/* Explicit Medical Delivery Notice */}
                <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  <strong>Secure Delivery:</strong> "Send to Patient" delivers the report directly into the patient's authenticated portal. Diagnostic documents are stored privately and never sent over unencrypted WhatsApp or email.
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADMIN REPORT PREVIEW & AUDIT LOG VIEWER       */}
      {/* ==================================================== */}
      {previewModalOpen && previewReportRecord && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card fade-in"
            style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '92vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              padding: '1.75rem',
              borderRadius: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-blue)', margin: 0 }}>
                  Report Preview & Audit: {previewReportRecord.reportId}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Patient: {previewReportRecord.patientName} • Booking: {previewReportRecord.bookingId}
                </span>
              </div>
              <button onClick={handleCloseAdminPreview} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Audit Trail Details */}
            <div
              style={{
                backgroundColor: 'var(--bg-slate)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <div><strong>Uploaded By:</strong> {previewReportRecord.uploadedBy}</div>
              <div><strong>Uploaded At:</strong> {new Date(previewReportRecord.uploadedAt).toLocaleString()}</div>
              <div><strong>Published By:</strong> {previewReportRecord.publishedBy}</div>
              <div><strong>Published At:</strong> {new Date(previewReportRecord.publishedAt).toLocaleString()}</div>
              {previewReportRecord.isReplacement && (
                <div style={{ gridColumn: '1 / -1', color: '#b45309' }}>
                  <strong>Replacement Note:</strong> Replaced report {previewReportRecord.replacedReportId} ({previewReportRecord.replacementReason})
                </div>
              )}
            </div>

            {/* PDF Viewer */}
            {previewBlobUrl ? (
              <div style={{ height: '480px', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                <iframe
                  src={`${previewBlobUrl}#toolbar=1`}
                  title="PDF Preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Structured manual report parameter findings are recorded for this report.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={handleCloseAdminPreview} className="btn btn-outline">
                Close Preview
              </button>
              {previewBlobUrl && (
                <a
                  href={previewBlobUrl}
                  download={previewReportRecord.fileName || `${previewReportRecord.reportId}_Report.pdf`}
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Download size={15} /> Download PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}

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

            {/* Admin Discount Control Box */}
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
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, patientName: sanitizeNameInput(e.target.value) })}
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
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, phoneNumber: sanitizePhoneInput(e.target.value) })}
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
                  type="text"
                  required
                  value={newBookingForm.totalAmount}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, totalAmount: Number(sanitizeDigitsOnly(e.target.value)) })}
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

      {/* MODAL 4: MANUAL REPORT EDITOR */}
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
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#fff',
              padding: '1.75rem',
              borderRadius: '24px',
              boxShadow: '0 20px 45px -10px rgba(0, 56, 179, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', margin: 0 }}>
                  Manual Report Editor: {selectedReportBooking.patientName}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Ref ID: {selectedReportBooking.id} • {selectedReportBooking.gender}, {selectedReportBooking.age}
                </span>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublishManualReport}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Report Title</label>
                  <input
                    type="text"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={reportForm.testName}
                    onChange={(e) => setReportForm({ ...reportForm, testName: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status Update</label>
                  <select
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                    value={reportForm.statusUpdate}
                    onChange={(e) => setReportForm({ ...reportForm, statusUpdate: e.target.value as any })}
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Process">In Process</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setIsReportModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                  <FileText size={16} /> Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
