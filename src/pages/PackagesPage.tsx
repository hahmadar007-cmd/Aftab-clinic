import React from 'react';
import { CheckCircle, Clock, Sparkles, TestTube, Check, Plus } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useBooking } from '../context/BookingContext';
import { HEALTH_PACKAGES } from '../data/labData';
import type { HealthPackage } from '../data/labData';

export const PackagesPage: React.FC = () => {
  const { addToCart, isInCart } = useBooking();

  return (
    <div className="app-container">
      <Layout>

      <main className="main-content">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Header */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--primary-green-light)',
                color: 'var(--primary-green)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              <Sparkles size={14} /> Official Diagnostic Packages
            </div>
            <h1 style={{ fontSize: '1.875rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
              Affordable Health Screening Packages
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto', fontSize: '0.9375rem' }}>
              Save up to 38% on comprehensive health evaluation bundles designed for early disease screening, diabetes management, and executive wellness checkups.
            </p>
          </div>

          {/* Health Packages Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {HEALTH_PACKAGES.map((pkg: HealthPackage) => {
              const inCart = isInCart(pkg.id);
              const discountPercentage = Math.round(((pkg.regularPrice - pkg.price) / pkg.regularPrice) * 100);

              return (
                <div
                  key={pkg.id}
                  className="card fade-in"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: '5px solid var(--primary-green)',
                    boxShadow: 'var(--shadow-md)',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Discount Badge */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: 'var(--primary-green-light)',
                          color: 'var(--primary-green)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        SAVE {discountPercentage}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {pkg.code}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                      {pkg.name}
                    </h2>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem', minHeight: '38px' }}>
                      {pkg.recommendedFor}
                    </p>

                    {/* Pricing */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-slate)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.75rem',
                      }}
                    >
                      <span style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                        Rs. {pkg.price.toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-muted)',
                          textDecoration: 'line-through',
                        }}
                      >
                        Rs. {pkg.regularPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Included Tests List */}
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                      Includes {pkg.testsIncluded.length} Key Tests:
                    </h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {pkg.testsIncluded.map((testName, i) => (
                        <li key={i} style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-body)' }}>
                          <CheckCircle size={16} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{testName}</span>
                        </li>
                      ))}
                    </ul>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <TestTube size={14} color="var(--primary-blue)" />
                        <span><strong>Sample:</strong> {pkg.sample}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Clock size={14} color="var(--primary-green)" />
                        <span><strong>Turnaround:</strong> {pkg.reportingTime}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(pkg, 'package')}
                    className={`btn ${inCart ? 'btn-outline' : 'btn-primary'}`}
                    style={{
                      width: '100%',
                      padding: '0.675rem',
                      backgroundColor: inCart ? '#ecfdf5' : 'var(--primary-green)',
                      borderColor: inCart ? 'var(--primary-green)' : 'transparent',
                      color: inCart ? 'var(--primary-green)' : '#ffffff',
                    }}
                  >
                    {inCart ? (
                      <>
                        <Check size={18} /> Package Added
                      </>
                    ) : (
                      <>
                        <Plus size={18} /> Book This Package
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      </Layout>
    </div>
  );
};
