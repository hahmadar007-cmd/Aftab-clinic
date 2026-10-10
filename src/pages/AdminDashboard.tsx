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
} from 'lucide-react';
import { Layout } from '../components/Layout';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'tests'>('overview');

  const stats = {
    totalBookings: 156,
    pendingBookings: 12,
    completedBookings: 138,
    totalRevenue: 245000,
    todayBookings: 8,
  };

  const recentBookings = [
    {
      id: 'AC-BK-789012',
      patientName: 'Muhammad Ali',
      tests: ['CBC', 'Lipid Profile'],
      date: '2026-10-10',
      status: 'pending',
      amount: 2700,
    },
    {
      id: 'AC-BK-789013',
      patientName: 'Fatima Khan',
      tests: ['Thyroid Function Tests'],
      date: '2026-10-10',
      status: 'confirmed',
      amount: 3500,
    },
    {
      id: 'AC-BK-789014',
      patientName: 'Ahmed Raza',
      tests: ['Complete Health Checkup'],
      date: '2026-10-09',
      status: 'completed',
      amount: 6999,
    },
  ];

  const renderOverview = () => (
    <div>
      <h2 style={{ fontSize: '1.375rem', marginBottom: '1.25rem', color: 'var(--primary-blue)' }}>
        Dashboard Overview
      </h2>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card" style={{ borderTop: '4px solid var(--primary-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShoppingBag size={22} color="var(--primary-blue)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Bookings</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{stats.totalBookings}</div>
        </div>

        <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Clock size={22} color="#f59e0b" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Pending</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{stats.pendingBookings}</div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--primary-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={22} color="var(--primary-green)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Completed</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>{stats.completedBookings}</div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--primary-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={22} color="var(--primary-green)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Revenue (PKR)</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>
            Rs. {stats.totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="var(--primary-blue)" />
          Recent Patient Bookings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                padding: '0.875rem',
                backgroundColor: 'var(--bg-slate)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9375rem' }}>{booking.patientName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.id}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {booking.tests.join(', ')} • {booking.date}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor:
                      booking.status === 'completed'
                        ? 'var(--success-bg)'
                        : booking.status === 'confirmed'
                        ? 'var(--primary-blue-light)'
                        : '#fef3c7',
                    color:
                      booking.status === 'completed'
                        ? 'var(--success-green)'
                        : booking.status === 'confirmed'
                        ? 'var(--primary-blue)'
                        : '#f59e0b',
                  }}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--primary-blue)', fontSize: '0.9375rem' }}>
                  Rs. {booking.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.375rem', color: 'var(--primary-blue)' }}>Manage Bookings</h2>
        <button className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
          <Plus size={16} /> New Booking
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Booking ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Patient</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Tests</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>{booking.id}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>{booking.patientName}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>{booking.tests.join(', ')}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>{booking.date}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor:
                          booking.status === 'completed'
                            ? 'var(--success-bg)'
                            : booking.status === 'confirmed'
                            ? 'var(--primary-blue-light)'
                            : '#fef3c7',
                        color:
                          booking.status === 'completed'
                            ? 'var(--success-green)'
                            : booking.status === 'confirmed'
                            ? 'var(--primary-blue)'
                            : '#f59e0b',
                      }}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                    Rs. {booking.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: 'var(--error-red)', borderColor: '#fca5a5' }}>
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
  );

  const renderTests = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.375rem', color: 'var(--primary-blue)' }}>Manage Tests</h2>
        <button className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
          <Plus size={16} /> Add New Test
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Code</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Test Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Rate (PKR)</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Sample</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>1300</td>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>Blood Complete Examination (CBC)</td>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>Hematology</td>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>Rs. 700</td>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>3CC EDTA Blood</td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: 'var(--error-red)', borderColor: '#fca5a5' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>1401</td>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>Blood Glucose (Fasting)</td>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>Biochemistry</td>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>Rs. 300</td>
                <td style={{ padding: '0.75rem', fontSize: '0.8125rem' }}>Sodium Fluoride</td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: 'var(--error-red)', borderColor: '#fca5a5' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <Layout>
        <main className="main-content">
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.5rem', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Admin Dashboard
              </h1>
              <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '0.8125rem' }}>
                Back to Patient Portal
              </Link>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'overview' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'overview' ? '2px solid var(--primary-blue)' : '2px solid transparent',
                  marginBottom: '-0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'bookings' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'bookings' ? '2px solid var(--primary-blue)' : '2px solid transparent',
                  marginBottom: '-0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'tests' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'tests' ? '2px solid var(--primary-blue)' : '2px solid transparent',
                  marginBottom: '-0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Tests & Packages
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'bookings' && renderBookings()}
            {activeTab === 'tests' && renderTests()}
          </div>
        </main>
      </Layout>
    </div>
  );
};
