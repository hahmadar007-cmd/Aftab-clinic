import React, { useState } from 'react';
import { Phone, MessageCircle, Settings, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WhatsAppButton: React.FC = () => {
  const { whatsAppConfig, updateWhatsAppConfig } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState(whatsAppConfig.displayPhone);
  const [numInput, setNumInput] = useState(whatsAppConfig.phoneNumber);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhatsAppConfig({
      displayPhone: phoneInput,
      phoneNumber: numInput.replace(/[^0-9]/g, ''),
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsModalOpen(false);
    }, 1200);
  };

  const whatsappUrl = `https://wa.me/${whatsAppConfig.phoneNumber}?text=${encodeURIComponent(
    whatsAppConfig.defaultMessage
  )}`;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-whatsapp"
        style={{
          padding: '0.4rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
        }}
        title={`Contact Aftab Clinic on WhatsApp (${whatsAppConfig.displayPhone})`}
      >
        <MessageCircle size={18} style={{ flexShrink: 0 }} />
        <span>WhatsApp</span>
      </a>

      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0.35rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
        }}
        title="Configure WhatsApp Contact Number"
      >
        <Settings size={15} />
      </button>

      {/* Modal to configure WhatsApp Contact */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            className="card fade-in"
            style={{
              width: '100%',
              maxWidth: '420px',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={20} color="var(--whatsapp-green)" />
              Configure WhatsApp Contact
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Customize the clinic's official WhatsApp contact details displayed on the top right app bar.
            </p>

            <form onSubmit={handleSaveConfig}>
              <div className="form-group">
                <label className="form-label">Display Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+92 300 1234567"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number (International Digits only)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={numInput}
                  onChange={(e) => setNumInput(e.target.value)}
                  placeholder="923001234567"
                  required
                />
              </div>

              {isSaved && (
                <div
                  style={{
                    backgroundColor: 'var(--success-bg)',
                    color: 'var(--primary-green)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <Check size={16} /> WhatsApp contact updated!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
