import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { WhatsAppButton } from './WhatsAppButton';

interface AppBarProps {
  onMenuClick?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  const { cart } = useBooking();

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.625rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        {/* Left: Menu Icon & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.375rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Open menu"
            >
              <Menu size={22} color="var(--text-body)" />
            </button>
          )}

          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <img
              src="/logo.png"
              alt="Aftab Clinic Logo"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--primary-blue)',
                  lineHeight: 1.1,
                }}
              >
                Aftab <span style={{ color: 'var(--primary-green)' }}>CLINIC</span>
              </span>
              <span
                className="hide-on-mobile"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                Medical Testing & Diagnostic Laboratory
              </span>
            </div>
          </Link>
        </div>

        {/* Right: WhatsApp Contact & Cart Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {cart.length > 0 && (
            <Link
              to="/book"
              style={{
                backgroundColor: 'var(--primary-green)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                minWidth: '24px',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              {cart.length}
            </Link>
          )}
          <WhatsAppButton />
        </div>
      </div>
    </header>
  );
};
