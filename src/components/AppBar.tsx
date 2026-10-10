import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, ShoppingBag, FileText, LayoutDashboard, Search, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { WhatsAppButton } from './WhatsAppButton';

export const AppBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useBooking();
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tests', label: 'Test Rates & Catalog', icon: Search },
    { path: '/packages', label: 'Health Packages', icon: PackageCheck },
    { path: '/book', label: 'Book Test', icon: ShoppingBag, badge: cart.length },
    { path: '/reports', label: 'Online Reports', icon: FileText },
  ];

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Top Left: Logo & Clinic Name */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <img
            src="/logo.png"
            alt="Aftab Clinic Logo"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--primary-blue)',
                lineHeight: 1.1,
              }}
            >
              Aftab <span style={{ color: 'var(--primary-green)' }}>CLINIC</span>
            </span>
            <span
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

        {/* Center: Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary-blue)' : 'var(--text-body)',
                  backgroundColor: isActive ? 'var(--primary-blue-light)' : 'transparent',
                  textDecoration: 'none',
                  position: 'relative',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <Icon size={16} color={isActive ? 'var(--primary-blue)' : 'var(--text-muted)'} />
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--primary-green)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      lineHeight: 1,
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Top Right: WhatsApp Contact & User Profile/Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <WhatsAppButton />

          {isAuthenticated && user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderLeft: '1px solid var(--border-light)',
                paddingLeft: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: 'var(--primary-blue-light)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <UserIcon size={15} color="var(--primary-blue)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-blue)' }}>
                  {user.fullName}
                </span>
              </div>

              <button
                onClick={logout}
                className="btn btn-outline"
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  color: 'var(--error-red)',
                  borderColor: '#fca5a5',
                }}
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
