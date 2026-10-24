import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, ShieldCheck, Bell, Check, FileText, X } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useLabData } from '../context/LabDataContext';
import { WhatsAppButton } from './WhatsAppButton';

interface AppBarProps {
  onMenuClick?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ onMenuClick }) => {
  const { cart } = useBooking();
  const { user, isAdmin } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useLabData();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Filter notifications for current user (or show all if admin)
  const userNotifications = notifications.filter((n) => {
    if (isAdmin) return true;
    if (!user) return false;
    return n.userId === user.id || n.userId === user.email || (n.userId && user.email && n.userId.includes(user.email));
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

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

        {/* Right: Admin Panel, Notifications, Cart, WhatsApp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', position: 'relative' }}>
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

          {/* In-App Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: unreadCount > 0 ? '#e0f2fe' : '#f8fafc',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-blue)',
                cursor: 'pointer',
                position: 'relative',
              }}
              title={`Notifications (${unreadCount} unread)`}
            >
              <Bell size={18} color="var(--primary-blue)" />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotifOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '340px',
                  maxWidth: '90vw',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  border: '1px solid var(--border-light)',
                  zIndex: 200,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-slate)',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={16} color="var(--primary-blue)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      In-App Notifications
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead(user?.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '0.75rem',
                          color: 'var(--primary-blue)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {userNotifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      No notifications at this time.
                    </div>
                  ) : (
                    userNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: '0.875rem 1rem',
                          borderBottom: '1px solid var(--border-light)',
                          backgroundColor: notif.read ? '#ffffff' : '#f0f9ff',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationRead(notif.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 2px' }}
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', margin: '0.25rem 0 0.5rem 0', lineHeight: 1.4 }}>
                          {notif.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {notif.reportId && (
                            <Link
                              to={`/reports?id=${notif.reportId}`}
                              onClick={() => {
                                markNotificationRead(notif.id);
                                setIsNotifOpen(false);
                              }}
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--primary-blue)',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <FileText size={13} /> View Report →
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
