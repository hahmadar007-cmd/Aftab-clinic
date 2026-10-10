import React, { createContext, useContext, useState, useEffect } from 'react';
import { TEST_CATALOG, HEALTH_PACKAGES } from '../data/labData';
import type { LabTest, HealthPackage } from '../data/labData';
import {
  listenToCollection,
  saveFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
} from '../config/firebase';

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
  tests: { code: string; name: string; price: number }[];
  totalAmount: number;
  discountPercent?: number;
  discountAmount?: number;
  status: 'Pending' | 'Confirmed' | 'Sample Collected' | 'In Process' | 'Completed' | 'Action Required' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
}

export interface LabReportRecord {
  reportId: string;
  bookingId: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  patientPhone?: string;
  date: string;
  testName: string;
  testsList?: { code: string; name: string; price: number }[];
  results: { parameter: string; value: string; unit: string; referenceRange: string; status: 'Normal' | 'High' | 'Low' }[];
  pathologist: string;
  notes?: string;
}

interface LabDataContextType {
  tests: LabTest[];
  packages: HealthPackage[];
  bookings: BookingRecord[];
  reports: LabReportRecord[];
  addTest: (test: Omit<LabTest, 'id'>) => void;
  updateTest: (id: string, test: Partial<LabTest>) => void;
  deleteTest: (id: string) => void;
  addBooking: (booking: Omit<BookingRecord, 'id' | 'date' | 'status' | 'paymentStatus'> & { id?: string }) => BookingRecord;
  updateBookingStatus: (id: string, status: BookingRecord['status'], paymentStatus?: BookingRecord['paymentStatus']) => void;
  updateBookingDiscount: (id: string, discount: number) => void;
  deleteBooking: (id: string) => void;
  addReport: (report: Omit<LabReportRecord, 'reportId'>) => void;
}

const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'AC-BK-789012',
    patientName: 'Muhammad Ali',
    phoneNumber: '0300-1234567',
    age: '45 Yrs',
    gender: 'Male',
    collectionType: 'Home Collection',
    address: 'House #42, Block B, Johar Town, Lahore',
    date: '2026-10-10',
    timeSlot: 'Morning (08:00 AM - 12:00 PM)',
    tests: [
      { code: '1300', name: 'Blood Complete Examination (CBC)', price: 700 },
      { code: '1420', name: 'Lipid Profile (Full)', price: 2000 },
    ],
    totalAmount: 2700,
    status: 'Pending',
    paymentStatus: 'Unpaid',
  },
  {
    id: 'AC-BK-789013',
    patientName: 'Fatima Khan',
    phoneNumber: '0321-9876543',
    age: '32 Yrs',
    gender: 'Female',
    collectionType: 'Clinic Visit',
    date: '2026-10-10',
    timeSlot: 'Afternoon (12:00 PM - 04:00 PM)',
    tests: [
      { code: '1501', name: 'TSH (Thyroid Stimulating Hormone)', price: 1200 },
      { code: '1502', name: 'FT3 (Free Triiodothyronine)', price: 1100 },
      { code: '1503', name: 'FT4 (Free Thyroxine)', price: 1200 },
    ],
    totalAmount: 3500,
    status: 'Confirmed',
    paymentStatus: 'Paid',
  },
  {
    id: 'AC-BK-789014',
    patientName: 'Ahmed Raza',
    phoneNumber: '0333-4567890',
    age: '55 Yrs',
    gender: 'Male',
    collectionType: 'Clinic Visit',
    date: '2026-10-09',
    tests: [
      { code: 'PKG-03', name: '03 COMPLETE HEALTH CHECKUP', price: 6999 },
    ],
    totalAmount: 6999,
    status: 'Completed',
    paymentStatus: 'Paid',
  },
  {
    id: 'AC-BK-789015',
    patientName: 'Zainab Bibi',
    phoneNumber: '0312-3456789',
    age: '28 Yrs',
    gender: 'Female',
    collectionType: 'Home Collection',
    address: 'Flat 302, Gulberg III, Lahore',
    date: '2026-10-08',
    tests: [
      { code: '1401', name: 'Blood Glucose (Fasting)', price: 300 },
      { code: '1403', name: 'HbA1c (Glycated Hemoglobin)', price: 1400 },
    ],
    totalAmount: 1700,
    status: 'Sample Collected',
    paymentStatus: 'Paid',
  },
];

const LabDataContext = createContext<LabDataContextType | undefined>(undefined);

export const LabDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tests, setTests] = useState<LabTest[]>(() => {
    const saved = localStorage.getItem('aftab_clinic_custom_tests');
    return saved ? JSON.parse(saved) : TEST_CATALOG;
  });

  const [packages] = useState<HealthPackage[]>(HEALTH_PACKAGES);

  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    const saved = localStorage.getItem('aftab_clinic_custom_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [reports, setReports] = useState<LabReportRecord[]>(() => {
    const saved = localStorage.getItem('aftab_clinic_custom_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Listen for real-time Firestore cloud database changes
  useEffect(() => {
    const unsubBookings = listenToCollection<BookingRecord>('bookings', (cloudBookings) => {
      if (cloudBookings && cloudBookings.length > 0) {
        setBookings(cloudBookings);
        localStorage.setItem('aftab_clinic_custom_bookings', JSON.stringify(cloudBookings));
      }
    });

    const unsubReports = listenToCollection<LabReportRecord>('reports', (cloudReports) => {
      if (cloudReports && cloudReports.length > 0) {
        setReports(cloudReports);
        localStorage.setItem('aftab_clinic_custom_reports', JSON.stringify(cloudReports));
      }
    });

    const unsubTests = listenToCollection<LabTest>('tests', (cloudTests) => {
      if (cloudTests && cloudTests.length > 0) {
        setTests(cloudTests);
        localStorage.setItem('aftab_clinic_custom_tests', JSON.stringify(cloudTests));
      }
    });

    return () => {
      unsubBookings();
      unsubReports();
      unsubTests();
    };
  }, []);

  const saveTests = (newTests: LabTest[]) => {
    setTests(newTests);
    localStorage.setItem('aftab_clinic_custom_tests', JSON.stringify(newTests));
  };

  const saveBookings = (newBookings: BookingRecord[]) => {
    setBookings(newBookings);
    localStorage.setItem('aftab_clinic_custom_bookings', JSON.stringify(newBookings));
  };

  const saveReports = (newReports: LabReportRecord[]) => {
    setReports(newReports);
    localStorage.setItem('aftab_clinic_custom_reports', JSON.stringify(newReports));
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

  const addBooking = (data: Omit<BookingRecord, 'id' | 'date' | 'status' | 'paymentStatus'> & { id?: string }) => {
    const bookingId = data.id || 'AC-BK-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: BookingRecord = {
      id: bookingId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      paymentStatus: 'Unpaid',
      ...data,
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

  const addReport = (report: Omit<LabReportRecord, 'reportId'>) => {
    const repId = 'AC-REP-' + Math.floor(100000 + Math.random() * 900000);
    const newReport: LabReportRecord = {
      ...report,
      reportId: repId,
    };
    saveReports([newReport, ...reports]);
    saveFirestoreDoc('reports', repId, newReport);
    // Automatically set corresponding booking status to Completed
    if (report.bookingId) {
      updateBookingStatus(report.bookingId, 'Completed');
    }
  };

  return (
    <LabDataContext.Provider
      value={{
        tests,
        packages,
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
