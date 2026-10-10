import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, TestTube, Clock, Check } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useBooking } from '../context/BookingContext';
import { TEST_CATALOG } from '../data/labData';
import type { LabTest } from '../data/labData';

export const TestsPage: React.FC = () => {
  const { addToCart, isInCart } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Hematology', 'Biochemistry', 'Hormones', 'Microbiology', 'PCR & Virology'];

  const filteredTests = useMemo(() => {
    return TEST_CATALOG.filter((test) => {
      const matchesSearch =
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.code.includes(searchTerm) ||
        test.sample.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="app-container">
      <Layout>

      <main className="main-content">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Header Banner */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem 2rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)',
              marginBottom: '1.5rem',
            }}
          >
            <h1 style={{ fontSize: '1.625rem', color: 'var(--primary-blue)', marginBottom: '0.375rem' }}>
              Diagnostic Test Catalog & Official Rates
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Search 80+ laboratory tests, check test codes, sample requirements, turnaround times, and official prices in PKR.
            </p>

            {/* Search & Filter Controls */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                marginTop: '1.25rem',
                alignItems: 'center',
              }}
            >
              <div className="input-wrapper" style={{ flex: 1, minWidth: '280px' }}>
                <Search className="input-icon" size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search test by name or code (e.g. CBC, Glucose, 1300, 41000)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Filter size={16} color="var(--text-muted)" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8125rem',
                      fontWeight: selectedCategory === cat ? 600 : 500,
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? 'var(--primary-blue)' : 'var(--border-light)',
                      backgroundColor: selectedCategory === cat ? 'var(--primary-blue)' : '#ffffff',
                      color: selectedCategory === cat ? '#ffffff' : 'var(--text-body)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-in-out',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {filteredTests.length} diagnostic test offerings
            </span>
          </div>

          {/* Tests Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredTests.map((test: LabTest) => {
              const inCart = isInCart(test.id);
              return (
                <div
                  key={test.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: '4px solid var(--primary-blue)',
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
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        CODE: {test.code}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {test.category}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.0625rem', color: 'var(--text-dark)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                      {test.name}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <TestTube size={15} color="var(--primary-blue)" />
                        <span><strong>Sample:</strong> {test.sample}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Clock size={15} color="var(--primary-green)" />
                        <span><strong>Reporting:</strong> {test.reportingTime}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '0.875rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Rate</span>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                        Rs. {test.rate.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>PKR</span>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(test, 'test')}
                      className={`btn ${inCart ? 'btn-outline' : 'btn-primary'}`}
                      style={{
                        padding: '0.45rem 0.875rem',
                        fontSize: '0.8125rem',
                        backgroundColor: inCart ? '#ecfdf5' : 'var(--primary-blue)',
                        borderColor: inCart ? 'var(--primary-green)' : 'transparent',
                        color: inCart ? 'var(--primary-green)' : '#ffffff',
                      }}
                    >
                      {inCart ? (
                        <>
                          <Check size={16} /> Added
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
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
