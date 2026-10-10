import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AppBar } from '../components/AppBar';

interface BookingHistory {
  id: string;
  date: string;
  tests: string[];
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  totalAmount: number;
  collectionType: 'Clinic Visit' | 'Home Collection';
}

const MOCK_HISTORY: BookingHistory[] = [
  {
    id: 'AC-BK-123456',
    date: '2026-10-08',
    tests: ['Blood Complete Examination (CBC)', 'Fasting Blood Glucose'],
    status: 'completed',
    totalAmount: 1000,
    collectionType: 'Clinic Visit',
  },
  {
    id: 'AC-BK-234567',
    date: '2026-10-10',
    tests: ['02 DIABETES & HEART CHECKUP'],
    status: 'confirmed',
    totalAmount: 3999,
    collectionType: 'Home Collection',
  },
  {
    id: 'AC-BK-345678',
    date: '2026-10-12',
    tests: ['Thyroid Function Tests (TFTs)', 'Vitamin D Level'],
    status: 'pending',
    totalAmount: 6600,
    collectionType: 'Clinic Visit',
  },
];

export const HistoryPage: React.FC = () => {
  const getStatusIcon = (status: BookingHistory['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="var(--success-green)" />;
      case 'confirmed':
        return <Clock size={20} color="var(--primary-blue)" />;
      case 'pending':
        return <AlertCircle size={20} color="#f59e0b" />;
      case 'cancelled':
        return <XCircle size={20} color="var(--error-red)" />;
    }
  };

  const getStatusColor = (status: BookingHistory['status']) => {
    switch (status) {
      case 'completed':
        return 'var(--success-green)';
      case 'confirmed':
        return 'var(--primary-blue)';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return 'var(--error-red)';
    }
  };

  return (
    <div className="app-container">
      <AppBar />

      <main className="main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary-blue)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Calendar size={28} />
            Appointment History
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {MOCK_HISTORY.map((booking) => (
              <div
                key={booking.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${getStatusColor(booking.status)}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {getStatusIcon(booking.status)}
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: getStatusColor(booking.status), textTransform: 'uppercase' }}>
                        {booking.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.125rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                      {booking.id}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {booking.date} • {booking.collectionType}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                      Rs. {booking.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tests Booked:</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {booking.tests.map((test, idx) => (
                      <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-body)', paddingLeft: '0.5rem', borderLeft: '2px solid var(--primary-blue-light)' }}>
                        {test}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
