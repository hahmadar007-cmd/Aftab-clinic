import React, { useState } from 'react';
import { Trash2, ShoppingBag, MessageCircle, User as UserIcon, Phone, MapPin } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import type { PatientInfo } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { AppBar } from '../components/AppBar';

export const BookingPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, totalPrice, generateWhatsAppVoucher } = useBooking();
  const { whatsAppConfig, user } = useAuth();

  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    patientName: user?.fullName || '',
    phoneNumber: user?.email.includes('@') ? '' : user?.email || '',
    age: '30',
    gender: 'Male',
    collectionType: 'Clinic Visit',
    address: '',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTimeSlot: 'Morning (08:00 AM - 12:00 PM)',
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientInfo.patientName.trim()) {
      setErrorMsg('Please enter the patient full name.');
      return;
    }
    if (!patientInfo.phoneNumber.trim()) {
      setErrorMsg('Please enter a valid contact mobile number.');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Your booking cart is empty. Please select at least one test or health package.');
      return;
    }
    if (patientInfo.collectionType === 'Home Collection' && !patientInfo.address.trim()) {
      setErrorMsg('Please enter your home address for sample collection.');
      return;
    }

    const voucherMessage = generateWhatsAppVoucher(patientInfo);
    const waUrl = `https://wa.me/${whatsAppConfig.phoneNumber}?text=${encodeURIComponent(voucherMessage)}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="app-container">
      <AppBar />

      <main className="main-content">
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary-blue)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ShoppingBag size={28} />
            Diagnostic Test Booking & Cart Checkout
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {/* Left Column: Cart Summary */}
            <div>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.125rem' }}>Selected Tests & Packages ({cart.length})</h2>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      style={{ background: 'none', border: 'none', color: 'var(--error-red)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                    <p style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Your booking cart is currently empty.</p>
                    <a href="/tests" className="btn btn-outline" style={{ fontSize: '0.8125rem' }}>
                      Browse Test Catalog
                    </a>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          backgroundColor: 'var(--bg-slate)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                            [{item.code}]
                          </span>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sample}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-blue)', fontSize: '0.9375rem' }}>
                            Rs. {item.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '2px solid var(--border-light)',
                        paddingTop: '1rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '1rem', fontWeight: 600 }}>Total Price (PKR):</span>
                      <span style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                        Rs. {totalPrice.toLocaleString()} PKR
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Patient Information & WhatsApp Voucher Generator */}
            <div>
              <div className="card">
                <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--primary-blue)' }}>
                  Patient & Sample Collection Details
                </h2>

                {errorMsg && (
                  <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-red)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleWhatsAppBooking}>
                  {/* Patient Name */}
                  <div className="form-group">
                    <label className="form-label">Patient Full Name</label>
                    <div className="input-wrapper">
                      <UserIcon className="input-icon" size={18} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Muhammad Ahmad"
                        value={patientInfo.patientName}
                        onChange={(e) => setPatientInfo({ ...patientInfo, patientName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone & Age */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">WhatsApp Mobile Number</label>
                      <div className="input-wrapper">
                        <Phone className="input-icon" size={18} />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="0300 1234567"
                          value={patientInfo.phoneNumber}
                          onChange={(e) => setPatientInfo({ ...patientInfo, phoneNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Age (Yrs)</label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ paddingLeft: '0.75rem' }}
                        placeholder="30"
                        value={patientInfo.age}
                        onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Gender & Collection Type */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-input"
                        style={{ paddingLeft: '0.75rem' }}
                        value={patientInfo.gender}
                        onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value as any })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Collection Method</label>
                      <select
                        className="form-input"
                        style={{ paddingLeft: '0.75rem' }}
                        value={patientInfo.collectionType}
                        onChange={(e) => setPatientInfo({ ...patientInfo, collectionType: e.target.value as any })}
                      >
                        <option value="Clinic Visit">Clinic Visit</option>
                        <option value="Home Collection">Home Sample Collection</option>
                      </select>
                    </div>
                  </div>

                  {/* Home Collection Address */}
                  {patientInfo.collectionType === 'Home Collection' && (
                    <div className="form-group">
                      <label className="form-label">Home Address for Phlebotomist Visit</label>
                      <div className="input-wrapper">
                        <MapPin className="input-icon" size={18} />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="House / Street address..."
                          value={patientInfo.address}
                          onChange={(e) => setPatientInfo({ ...patientInfo, address: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Date & Time Slot */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Preferred Date</label>
                      <input
                        type="date"
                        className="form-input"
                        style={{ paddingLeft: '0.75rem' }}
                        value={patientInfo.preferredDate}
                        onChange={(e) => setPatientInfo({ ...patientInfo, preferredDate: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Time Slot</label>
                      <select
                        className="form-input"
                        style={{ paddingLeft: '0.75rem' }}
                        value={patientInfo.preferredTimeSlot}
                        onChange={(e) => setPatientInfo({ ...patientInfo, preferredTimeSlot: e.target.value })}
                      >
                        <option>Morning (08:00 AM - 12:00 PM)</option>
                        <option>Afternoon (12:00 PM - 04:00 PM)</option>
                        <option>Evening (04:00 PM - 08:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-whatsapp"
                    disabled={cart.length === 0}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      fontSize: '0.9375rem',
                      marginTop: '1rem',
                      opacity: cart.length === 0 ? 0.6 : 1,
                    }}
                  >
                    <MessageCircle size={20} />
                    <span>Send Booking Voucher via WhatsApp ({whatsAppConfig.displayPhone})</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
