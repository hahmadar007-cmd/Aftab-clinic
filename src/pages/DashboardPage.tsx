import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MessageCircle,
  ShieldCheck,
  Clock,
  Award,
  Sparkles,
  Microscope,
  PackageCheck,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HEALTH_PACKAGES } from '../data/labData';
import { Layout } from '../components/Layout';

export const DashboardPage: React.FC = () => {
  const { user, whatsAppConfig } = useAuth();

  const whatsappUrl = `https://wa.me/${whatsAppConfig.phoneNumber}?text=${encodeURIComponent(
    'Hello Aftab Clinic, I am logged into the patient portal and would like to ask a question.'
  )}`;

  return (
    <div className="app-container">
      <Layout>
        <main className="main-content">
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '1rem',
            }}
          >
            {/* Hero Welcome Banner */}
            <div
              className="fade-in"
              style={{
                background: 'linear-gradient(135deg, #0056b3 0%, #003e80 50%, #00a859 100%)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem 1.25rem',
                boxShadow: 'var(--shadow-lg)',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(4px)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                  }}
                >
                  <Sparkles size={14} /> Diagnostic Patient Portal Active
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                  Welcome back, {user?.fullName || 'Valued Patient'}
                </h1>
                <p style={{ fontSize: '0.9375rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                  Explore 80+ diagnostic lab tests, official health packages, online report downloads, and 1-click WhatsApp sample collection booking.
                </p>
              </div>

              {/* Decorative background shape */}
              <div
                className="hide-on-mobile"
                style={{
                  position: 'absolute',
                  right: '-40px',
                  bottom: '-40px',
                  opacity: 0.15,
                  pointerEvents: 'none',
                }}
              >
                <Microscope size={280} color="#ffffff" />
              </div>
            </div>

            {/* Quick Actions Grid */}
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>
              Quick Patient Actions
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              {/* Action 1: Browse Rates */}
              <Link
                to="/tests"
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  textDecoration: 'none',
                  borderColor: 'var(--primary-blue-light)',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--primary-blue-light)',
                    color: 'var(--primary-blue)',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Search size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.9375rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Search Test Rates</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Lookup official PKR test rates & sample codes.
                  </p>
                </div>
              </Link>

              {/* Action 2: Health Packages */}
              <Link
                to="/packages"
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--primary-green-light)',
                    color: 'var(--primary-green)',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <PackageCheck size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.9375rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Health Packages</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Screening packages starting from Rs. 1,999.
                  </p>
                </div>
              </Link>

              {/* Action 3: Online Reports */}
              <Link
                to="/reports"
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <FileText size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.9375rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Online Lab Reports</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    View & print signed pathologist result reports.
                  </p>
                </div>
              </Link>

              {/* Action 4: WhatsApp Direct */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  textDecoration: 'none',
                  backgroundColor: '#f0fdf4',
                  borderColor: '#bbf7d0',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--whatsapp-green)',
                    color: '#ffffff',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <MessageCircle size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.9375rem', color: '#166534', marginBottom: '0.25rem' }}>WhatsApp Inquiry</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#15803d' }}>
                    Chat directly with our team ({whatsAppConfig.displayPhone}).
                  </p>
                </div>
              </a>
            </div>

            {/* Featured Official Health Screening Packages */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', color: 'var(--text-dark)' }}>
                Official Health Packages
              </h2>
              <Link to="/packages" style={{ fontSize: '0.8125rem', color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }}>
                View All →
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              {HEALTH_PACKAGES.slice(0, 3).map((pkg) => (
                <div key={pkg.id} className="card" style={{ borderTop: '4px solid var(--primary-green)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-green)', backgroundColor: 'var(--primary-green-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {pkg.code}
                  </span>
                  <h3 style={{ fontSize: '1.0625rem', color: 'var(--primary-blue)', margin: '0.5rem 0 0.25rem 0' }}>
                    {pkg.name}
                  </h3>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>
                    Rs. {pkg.price.toLocaleString()} <span style={{ fontSize: '0.8125rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>Rs. {pkg.regularPrice.toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Includes {pkg.testsIncluded.length} key tests ({pkg.testsIncluded.slice(0, 3).join(', ')}...)
                  </p>
                  <Link to="/packages" className="btn btn-outline" style={{ width: '100%', fontSize: '0.8125rem' }}>
                    View Details
                  </Link>
                </div>
              ))}
            </div>

            {/* Quality & Standards Section */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="var(--primary-green)" />
                Diagnostic Quality & Laboratory Standards
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <ShieldCheck size={18} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Automated Precision</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>High-throughput clinical analyzers for rapid result accuracy.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <ShieldCheck size={18} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Pathologist Verified</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>All diagnostic reports are reviewed and electronically signed by senior FCPS pathologists.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <ShieldCheck size={18} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>ISO Standards</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Internal and external proficiency quality assurance controls.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic Info & Contact Banner */}
            <div
              className="card mobile-stack"
              style={{
                backgroundColor: '#ffffff',
                borderLeft: '4px solid var(--primary-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1 }}>
                <div
                  style={{
                    backgroundColor: 'var(--primary-blue-light)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--primary-blue)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock size={22} style={{ flexShrink: 0 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                    Laboratory Operating Hours
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Mon – Sat: 08:00 AM – 10:00 PM | Sun: 09:00 AM – 04:00 PM
                  </p>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ padding: '0.625rem 1rem', flexShrink: 0, width: 'fit-content' }}
              >
                <MessageCircle size={18} style={{ flexShrink: 0 }} />
                <span>WhatsApp Contact</span>
              </a>
            </div>
          </div>
        </main>
      </Layout>
    </div>
  );
};
