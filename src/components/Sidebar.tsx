import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, Search, PackageCheck, ShoppingBag, FileText, History, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cart } = useBooking();
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tests', label: 'Test Rates & Catalog', icon: Search },
    { path: '/packages', label: 'Health Packages', icon: PackageCheck },
    { path: '/book', label: 'Book Test', icon: ShoppingBag, badge: cart.length },
    { path: '/reports', label: 'Online Reports', icon: FileText },
    { path: '/history', label: 'History', icon: History },
  ];

  if (isAdmin) {
    navLinks.push({ path: '/admin', label: 'Admin Dashboard', icon: Users });
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '280px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <img
            src="/logo.png"
            alt="Aftab Clinic Logo"
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close menu"
          >
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9375rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary-blue)' : 'var(--text-body)',
                  backgroundColor: isActive ? 'var(--primary-blue-light)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: '0.5rem',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <Icon size={20} color={isActive ? 'var(--primary-blue)' : 'var(--text-muted)'} />
                <span style={{ flex: 1 }}>{link.label}</span>
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

        {/* User Info & Logout */}
        {isAuthenticated && user && (
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-slate)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
                padding: '0.5rem',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary-blue-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-blue)',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                {user.fullName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                width: '100%',
                padding: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--error-red)',
                backgroundColor: '#ffffff',
                border: '1px solid #fca5a5',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};
