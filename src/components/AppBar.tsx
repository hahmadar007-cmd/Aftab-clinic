import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { WhatsAppButton } from './WhatsAppButton';

interface AppBarProps {
  onMenuClick?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  const { cart } = useBooking();
  const { isAdmin } = useAuth();

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
          padding: '0.625rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Left: Menu Icon & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

        {/* Right: Cart Icon & WhatsApp Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {isAdmin && (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                backgroundColor: 'var(--primary-blue-light)',
                color: 'var(--primary-blue)',
                border: '1px solid var(--primary-blue)',
                padding: '0.3rem 0.625rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
              title="Admin Control Panel"
            >
              <ShieldCheck size={16} />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* Cart Icon & Badge */}
          <Link
            to="/book"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: cart.length > 0 ? 'var(--primary-blue-light)' : '#f8fafc',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-blue)',
              textDecoration: 'none',
              position: 'relative',
              transition: 'all 0.15s ease-in-out',
              flexShrink: 0,
            }}
            title={`Booking Cart (${cart.length} items)`}
          >
            <ShoppingBag size={19} color="var(--primary-blue)" style={{ flexShrink: 0 }} />
            {cart.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--primary-green)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                {cart.length}
              </span>
            )}
          </Link>

          <WhatsAppButton />
        </div>
      </div>
    </header>
  );
};
