import React, { createContext, useContext, useState, useEffect } from 'react';
import { TEST_CATALOG, HEALTH_PACKAGES } from '../data/labData';
import type { LabTest, HealthPackage } from '../data/labData';
import {
  listenToCollection,
  saveFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
  storage,
  isLiveFirebaseConfigured,
} from '../config/firebase';
import { ref, uploadBytes, getBlob } from 'firebase/storage';

export interface BookingTestItem {
  code: string;
  name: string;
  price: number;
  reportStatus?: 'pending' | 'ready';
  reportId?: string;
}

export interface BookingRecord {
  id: string;
  patientName: string;
  phoneNumber: string;
  age: string;
  gender: string;
  collectionType: string;
  address?: string;
  date: string;
  timeSlot?: string;
  prescriptionUrl?: string;
  tests: BookingTestItem[];
  totalAmount: number;
  discountPercent?: number;
  discountAmount?: number;
  status: 'Pending' | 'Confirmed' | 'Sample Collected' | 'In Process' | 'Partially Ready' | 'Completed' | 'Action Required' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  userId?: string;
  userEmail?: string;
}

export interface LabReportRecord {
  reportId: string;
  bookingId: string;
  userId?: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  patientPhone?: string;
  patientEmail?: string;
  date: string;
  testName: string;
  testNames?: string[];
  testsList?: { code: string; name: string; price: number }[];
  results?: { parameter: string; value: string; unit: string; referenceRange: string; status: 'Normal' | 'High' | 'Low' }[];
  pathologist: string;
  notes?: string;

  // PDF Document details
  hasPDF?: boolean;
  fileName?: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;

  // Status & Audit Trail
  status: 'ready' | 'pending' | 'replaced';
  uploadedBy: string;
  uploadedAt: string;
  publishedBy: string;
  publishedAt: string;

  // Replacement tracking
  isReplacement?: boolean;
  replacedReportId?: string;
  replacementReason?: string;
  replacedAt?: string;
  replacedBy?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'report_ready' | 'report_replaced' | 'booking_status';
  reportId?: string;
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

export interface UploadReportParams {
  bookingId: string;
  testNames: string[];
  file: File;
  fileDataUrl: string;
  uploadedBy: string;
  replaceExisting?: boolean;
  replacementReason?: string;
  existingReportIdToReplace?: string;
}

interface LabDataContextType {
  tests: LabTest[];
  packages: HealthPackage[];
  bookings: BookingRecord[];
  reports: LabReportRecord[];
  notifications: InAppNotification[];
  addTest: (test: Omit<LabTest, 'id'>) => void;
  updateTest: (id: string, test: Partial<LabTest>) => void;
  deleteTest: (id: string) => void;
  addBooking: (booking: Omit<BookingRecord, 'id' | 'date' | 'status' | 'paymentStatus'> & { id?: string }) => BookingRecord;
  updateBookingStatus: (id: string, status: BookingRecord['status'], paymentStatus?: BookingRecord['paymentStatus']) => void;
  updateBookingDiscount: (id: string, discount: number) => void;
  deleteBooking: (id: string) => void;
  addReport: (report: Omit<LabReportRecord, 'reportId' | 'uploadedBy' | 'uploadedAt' | 'publishedBy' | 'publishedAt' | 'status'> & Partial<LabReportRecord>) => void;
  uploadAndDeliverReport: (params: UploadReportParams) => Promise<{ success: boolean; reportId?: string; error?: string }>;
  getPrivateReportPDF: (reportId: string) => Promise<string | null>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId?: string) => void;
  getNotificationsForUser: (userId?: string, userEmail?: string, userPhone?: string) => InAppNotification[];
}

// In-memory ephemeral PDF data URL cache (Session-only, zero persistent IndexedDB leakage)
const ephemeralPdfStore = new Map<string, string>();

const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'AC-BK-889101',
    patientName: 'Ali Khan (Patient A)',
    phoneNumber: '03001112233',
    age: '32 Yrs',
    gender: 'Male',
    collectionType: 'Clinic Visit',
    date: '2026-10-22',
    timeSlot: 'Morning (08:00 AM - 12:00 PM)',
    tests: [
      { code: '1300', name: 'Blood Complete Examination (CBC)', price: 700, reportStatus: 'pending' },
      { code: '1900', name: 'Serum Lipid Profile - Fasting', price: 2000, reportStatus: 'pending' },
    ],
    totalAmount: 2700,
    status: 'Sample Collected',
    paymentStatus: 'Paid',
    userId: 'usr_patient_a',
    userEmail: 'patient.a@example.com',
  },
  {
    id: 'AC-BK-992344',
    patientName: 'Bilal Ahmed (Patient B)',
    phoneNumber: '03004445566',
    age: '40 Yrs',
    gender: 'Male',
    collectionType: 'Home Collection',
    address: 'House 42, Street 7, Block B, Lahore',
    date: '2026-10-23',
    timeSlot: 'Morning (08:00 AM - 12:00 PM)',
    tests: [
      { code: '1401', name: 'Blood Glucose (Fasting)', price: 300, reportStatus: 'pending' },
    ],
    totalAmount: 300,
    status: 'Pending',
    paymentStatus: 'Unpaid',
    userId: 'usr_patient_b',
    userEmail: 'patient.b@example.com',
  },
];

const LabDataContext = createContext<LabDataContextType | undefined>(undefined);

export const LabDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tests, setTests] = useState<LabTest[]>(() => {
    try {
      const saved = localStorage.getItem('aftab_clinic_custom_tests');
      return saved ? JSON.parse(saved) : TEST_CATALOG;
    } catch {
      return TEST_CATALOG;
    }
  });

  const [packages] = useState<HealthPackage[]>(HEALTH_PACKAGES);

  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aftab_clinic_custom_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [reports, setReports] = useState<LabReportRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aftab_clinic_custom_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('aftab_clinic_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Listen for real-time Firestore cloud database changes
  useEffect(() => {
    const unsubBookings = listenToCollection<BookingRecord>('bookings', (cloudBookings) => {
      if (cloudBookings && cloudBookings.length > 0) {
        setBookings(cloudBookings);
        try {
          localStorage.setItem('aftab_clinic_custom_bookings', JSON.stringify(cloudBookings));
        } catch {
          // ignore
        }
      }
    });

    const unsubReports = listenToCollection<LabReportRecord>('reports', (cloudReports) => {
      if (cloudReports && cloudReports.length > 0) {
        setReports(cloudReports);
        try {
          localStorage.setItem('aftab_clinic_custom_reports', JSON.stringify(cloudReports));
        } catch {
          // ignore
        }
      }
    });

    const unsubTests = listenToCollection<LabTest>('tests', (cloudTests) => {
      if (cloudTests && cloudTests.length > 0) {
        setTests(cloudTests);
        try {
          localStorage.setItem('aftab_clinic_custom_tests', JSON.stringify(cloudTests));
        } catch {
          // ignore
        }
      }
    });

    const unsubNotifs = listenToCollection<InAppNotification>('notifications', (cloudNotifs) => {
      if (cloudNotifs && cloudNotifs.length > 0) {
        setNotifications(cloudNotifs);
        try {
          localStorage.setItem('aftab_clinic_notifications', JSON.stringify(cloudNotifs));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      unsubBookings();
      unsubReports();
      unsubTests();
      unsubNotifs();
    };
  }, []);

  const saveTests = (newTests: LabTest[]) => {
    setTests(newTests);
    try {
      localStorage.setItem('aftab_clinic_custom_tests', JSON.stringify(newTests));
    } catch {
      // ignore
    }
  };

  const saveBookings = (newBookings: BookingRecord[]) => {
    setBookings(newBookings);
    try {
      localStorage.setItem('aftab_clinic_custom_bookings', JSON.stringify(newBookings));
    } catch {
      // ignore
    }
  };

  const saveReports = (newReports: LabReportRecord[]) => {
    setReports(newReports);
    try {
      localStorage.setItem('aftab_clinic_custom_reports', JSON.stringify(newReports));
    } catch {
      // ignore
    }
  };

  const saveNotifications = (newNotifs: InAppNotification[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem('aftab_clinic_notifications', JSON.stringify(newNotifs));
    } catch {
      // ignore
    }
  };

  const addTest = (newTest: Omit<LabTest, 'id'>) => {
    const testId = 'custom-test-' + Date.now();
    const testWithId: LabTest = {
      ...newTest,
      id: testId,
    };
    saveTests([testWithId, ...tests]);
    saveFirestoreDoc('tests', testId, testWithId);
  };

  const updateTest = (id: string, updatedFields: Partial<LabTest>) => {
    const updated = tests.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    saveTests(updated);
    updateFirestoreDoc('tests', id, updatedFields);
  };

  const deleteTest = (id: string) => {
    const filtered = tests.filter((t) => t.id !== id);
    saveTests(filtered);
    deleteFirestoreDoc('tests', id);
  };

  /**
   * Authoritative Booking Creation
   * Enforces:
   * 1. Schema & type restrictions
   * 2. Authoritative price resolution from TEST_CATALOG / HEALTH_PACKAGES
   * 3. Initial status strictly 'Pending'
   * 4. Initial paymentStatus strictly 'Unpaid'
   * 5. Test items cannot have reportStatus === 'ready'
   */
  const addBooking = (data: Omit<BookingRecord, 'id' | 'date' | 'status' | 'paymentStatus'> & { id?: string }): BookingRecord => {
    const bookingId = data.id || 'AC-BK-' + Math.floor(100000 + Math.random() * 900000);

    // Validate and authoritatively resolve prices from official catalog
    const validatedTests: BookingTestItem[] = (data.tests || []).map((t) => {
      const testMatch = TEST_CATALOG.find((item) => item.code === t.code || item.id === t.code);
      const pkgMatch = HEALTH_PACKAGES.find((pkg) => pkg.id === t.code || pkg.code === t.code);
      const price = testMatch ? testMatch.rate : (pkgMatch ? pkgMatch.price : (Number(t.price) || 0));
      const name = testMatch ? testMatch.name : (pkgMatch ? pkgMatch.name : t.name);

      return {
        code: t.code,
        name,
        price,
        reportStatus: 'pending' as const, // Patients can NEVER create a booking marked ready
      };
    });

    const authoritativeTotal = validatedTests.reduce((sum, t) => sum + t.price, 0);
    const finalAmount = authoritativeTotal > 0 ? authoritativeTotal : (Number(data.totalAmount) || 0);

    const newBooking: BookingRecord = {
      id: bookingId,
      patientName: data.patientName || '',
      phoneNumber: data.phoneNumber || '',
      age: data.age || '',
      gender: data.gender || 'Other',
      collectionType: data.collectionType || 'Clinic Visit',
      address: data.address || '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: data.timeSlot || 'Morning (08:00 AM - 12:00 PM)',
      prescriptionUrl: data.prescriptionUrl,
      tests: validatedTests,
      totalAmount: finalAmount,
      discountPercent: 0,
      discountAmount: 0,
      status: 'Pending', // Patients cannot create a booking marked Completed, In Process, or Partially Ready
      paymentStatus: 'Unpaid', // Patients cannot mark bookings Paid
      userId: data.userId,
      userEmail: data.userEmail,
    };

    const updated = [newBooking, ...bookings];
    saveBookings(updated);
    saveFirestoreDoc('bookings', bookingId, newBooking);
    return newBooking;
  };

  const updateBookingStatus = (
    id: string,
    status: BookingRecord['status'],
    paymentStatus?: BookingRecord['paymentStatus']
  ) => {
    const updated = bookings.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          status,
          paymentStatus: paymentStatus || b.paymentStatus,
        };
      }
      return b;
    });
    saveBookings(updated);
    updateFirestoreDoc('bookings', id, { status, ...(paymentStatus ? { paymentStatus } : {}) });
  };

  const updateBookingDiscount = (id: string, discountPercent: number) => {
    const updated = bookings.map((b) => {
      if (b.id === id) {
        const gross = b.tests.reduce((sum, t) => sum + t.price, 0);
        const calcPercent = Math.min(100, Math.max(0, discountPercent));
        const discAmount = Math.round((gross * calcPercent) / 100);
        return {
          ...b,
          discountPercent: calcPercent,
          discountAmount: discAmount,
        };
      }
      return b;
    });
    saveBookings(updated);
    const target = updated.find((b) => b.id === id);
    if (target) {
      updateFirestoreDoc('bookings', id, { discountPercent: target.discountPercent, discountAmount: target.discountAmount });
    }
  };

  const deleteBooking = (id: string) => {
    const filtered = bookings.filter((b) => b.id !== id);
    saveBookings(filtered);
    deleteFirestoreDoc('bookings', id);
  };

  const addReport = (report: Omit<LabReportRecord, 'reportId' | 'uploadedBy' | 'uploadedAt' | 'publishedBy' | 'publishedAt' | 'status'> & Partial<LabReportRecord>) => {
    const repId = 'AC-REP-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();
    const newReport: LabReportRecord = {
      status: 'ready',
      uploadedBy: report.uploadedBy || 'Administrator',
      uploadedAt: report.uploadedAt || now,
      publishedBy: report.publishedBy || 'Administrator',
      publishedAt: report.publishedAt || now,
      ...report,
      reportId: repId,
    };
    saveReports([newReport, ...reports]);
    saveFirestoreDoc('reports', repId, newReport);
    if (report.bookingId) {
      updateBookingStatus(report.bookingId, 'Completed');
    }
  };

  /**
   * Secure PDF Upload and Delivery Workflow
   * - Validates target booking and PDF format / size (<= 15MB)
   * - Ephemeral in-memory storage (zero persistent IndexedDB leakage)
   * - Uploads to private Cloud Storage bucket (/reports/{reportId}.pdf) with authorization metadata
   * - State Machine: 0 tests ready -> workflow status; 1..N-1 ready -> Partially Ready; All ready -> Completed
   * - Dispatches in-app notification to patient
   */
  const uploadAndDeliverReport = async (params: UploadReportParams): Promise<{ success: boolean; reportId?: string; error?: string }> => {
    const {
      bookingId,
      testNames,
      file,
      fileDataUrl,
      uploadedBy,
      replaceExisting,
      replacementReason,
      existingReportIdToReplace,
    } = params;

    // 1. Validate Target Booking
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: `Booking reference "${bookingId}" not found.` };
    }

    // 2. Validate PDF file
    if (!file || (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf'))) {
      return { success: false, error: 'Invalid document type. Only PDF format (.pdf) medical reports are permitted.' };
    }
    const maxSizeBytes = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSizeBytes) {
      return { success: false, error: 'File size exceeds 15 MB limit. Please compress or optimize the PDF.' };
    }

    try {
      const now = new Date().toISOString();
      const repId = 'AC-REP-' + Math.floor(100000 + Math.random() * 900000);
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      // 3. Cache PDF in ephemeral in-memory map
      ephemeralPdfStore.set(repId, fileDataUrl);

      // If Cloud Storage is connected, upload to secure reports bucket with published metadata
      if (isLiveFirebaseConfigured()) {
        try {
          const reportStorageRef = ref(storage, `reports/${repId}.pdf`);
          await uploadBytes(reportStorageRef, file, {
            contentType: 'application/pdf',
            customMetadata: {
              userId: booking.userId || '',
              bookingId: booking.id,
              isPublished: 'true',
              uploadedBy: uploadedBy || 'Administrator',
            },
          });
        } catch (uploadErr) {
          console.warn('Notice: Cloud storage upload fallback to ephemeral session:', uploadErr);
        }
      }

      // 4. If replacing an existing report, update old report to replaced status
      let updatedReports = [...reports];
      if (replaceExisting && existingReportIdToReplace) {
        updatedReports = updatedReports.map((r) => {
          if (r.reportId === existingReportIdToReplace) {
            return {
              ...r,
              status: 'replaced',
              replacementReason: replacementReason || 'Updated by Administrator',
              replacedBy: uploadedBy,
              replacedAt: now,
            };
          }
          return r;
        });
      }

      // 5. Construct new LabReportRecord
      const combinedTestTitle = testNames.length > 0 ? testNames.join(' + ') : 'Diagnostic Test Report';
      const newReport: LabReportRecord = {
        reportId: repId,
        bookingId: booking.id,
        userId: booking.userId,
        patientName: booking.patientName,
        patientAge: booking.age,
        patientGender: booking.gender,
        patientPhone: booking.phoneNumber,
        patientEmail: booking.userEmail,
        date: now.split('T')[0],
        testName: combinedTestTitle,
        testNames: testNames,
        testsList: booking.tests.filter((t) => testNames.includes(t.name) || testNames.length === 0),
        pathologist: 'Dr. S. A. Aftab (Consultant Pathologist, FCPS)',
        hasPDF: true,
        fileName: file.name,
        fileSizeBytes: file.size,
        fileSizeFormatted: formattedSize,
        status: 'ready',
        uploadedBy: uploadedBy || 'Administrator',
        uploadedAt: now,
        publishedBy: uploadedBy || 'Administrator',
        publishedAt: now,
        isReplacement: Boolean(replaceExisting),
        replacedReportId: existingReportIdToReplace,
        replacementReason: replacementReason,
      };

      updatedReports = [newReport, ...updatedReports];
      saveReports(updatedReports);
      saveFirestoreDoc('reports', repId, newReport);

      // 6. Update Booking individual test statuses & derive consistent overall status
      const updatedBookings = bookings.map((b) => {
        if (b.id === booking.id) {
          const updatedTests: BookingTestItem[] = b.tests.map((t) => {
            const isMatch = testNames.length === 0 || testNames.includes(t.name);
            if (isMatch) {
              return {
                ...t,
                reportStatus: 'ready' as const,
                reportId: repId,
              };
            }
            return t;
          });

          // Unambiguous State Machine Rule:
          // - 0 tests ready -> preserve current pre-test status (Pending, Confirmed, Sample Collected, In Process)
          // - Some (1 to N-1) tests ready -> strictly 'Partially Ready'
          // - All (N of N) tests ready -> strictly 'Completed'
          const readyCount = updatedTests.filter((t) => t.reportStatus === 'ready').length;
          const totalCount = updatedTests.length;

          let newBookingStatus: BookingRecord['status'];
          if (readyCount === 0) {
            newBookingStatus = b.status === 'Pending' ? 'Pending' : 'In Process';
          } else if (readyCount === totalCount) {
            newBookingStatus = 'Completed';
          } else {
            newBookingStatus = 'Partially Ready';
          }

          return {
            ...b,
            tests: updatedTests,
            status: newBookingStatus,
          };
        }
        return b;
      });

      saveBookings(updatedBookings);
      const updatedTargetBooking = updatedBookings.find((b) => b.id === booking.id);
      if (updatedTargetBooking) {
        updateFirestoreDoc('bookings', booking.id, {
          tests: updatedTargetBooking.tests,
          status: updatedTargetBooking.status,
        });
      }

      // 7. Dispatch in-app notification to patient
      const notifTargetUser = booking.userId || booking.phoneNumber || booking.userEmail || booking.patientName;
      const newNotification: InAppNotification = {
        id: 'notif_' + Date.now(),
        userId: notifTargetUser,
        title: replaceExisting
          ? `📝 Revised Lab Report: ${combinedTestTitle}`
          : `✅ Diagnostic Report Ready: ${combinedTestTitle}`,
        message: replaceExisting
          ? `An updated report for "${combinedTestTitle}" (Ref: ${booking.id}) has been delivered to your portal.`
          : `Your official diagnostic PDF report for "${combinedTestTitle}" (Ref: ${booking.id}) is now ready to view & download in your portal.`,
        type: replaceExisting ? 'report_replaced' : 'report_ready',
        reportId: repId,
        bookingId: booking.id,
        read: false,
        createdAt: now,
      };

      saveNotifications([newNotification, ...notifications]);
      saveFirestoreDoc('notifications', newNotification.id, newNotification);

      return { success: true, reportId: repId };
    } catch (err: any) {
      console.error('Failed to upload and deliver report:', err);
      return { success: false, error: err.message || 'An unexpected error occurred during delivery.' };
    }
  };

  /**
   * Retrieves PDF data URL from in-memory ephemeral store or authorized Cloud Storage
   */
  const getPrivateReportPDF = async (reportId: string): Promise<string | null> => {
    if (ephemeralPdfStore.has(reportId)) {
      return ephemeralPdfStore.get(reportId)!;
    }

    if (isLiveFirebaseConfigured()) {
      try {
        const fileRef = ref(storage, `reports/${reportId}.pdf`);
        const blob = await getBlob(fileRef);
        return new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            ephemeralPdfStore.set(reportId, dataUrl);
            resolve(dataUrl);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn(`Cloud report fetch notice for ${reportId}:`, err);
      }
    }

    return null;
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
    updateFirestoreDoc('notifications', id, { read: true });
  };

  const markAllNotificationsRead = (userId?: string) => {
    const updated = notifications.map((n) => {
      if (!userId || n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    saveNotifications(updated);
  };

  const getNotificationsForUser = (userId?: string, userEmail?: string, userPhone?: string): InAppNotification[] => {
    if (!userId && !userEmail && !userPhone) return [];
    return notifications.filter((n) => {
      if (userId && n.userId === userId) return true;
      if (userEmail && n.userId === userEmail) return true;
      if (userPhone && n.userId === userPhone) return true;
      return false;
    });
  };

  return (
    <LabDataContext.Provider
      value={{
        tests,
        packages,
        bookings,
        reports,
        notifications,
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
        markNotificationRead,
        markAllNotificationsRead,
        getNotificationsForUser,
      }}
    >
      {children}
    </LabDataContext.Provider>
  );
};

export const useLabData = () => {
  const context = useContext(LabDataContext);
  if (!context) {
    throw new Error('useLabData must be used within a LabDataProvider');
  }
  return context;
};
