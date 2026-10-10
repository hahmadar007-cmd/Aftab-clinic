import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanIdentifier = email.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Please enter your email address or phone number.');
      return;
    }
    if (!cleanIdentifier.includes('@') && cleanIdentifier.replace(/[^0-9]/g, '').length < 10) {
      setErrorMessage('Please enter a valid Email Address or Phone Number (at least 10 digits).');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const result = register(fullName, email, password);
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-slate)' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        <div
          className="card fade-in"
          style={{
            width: '100%',
            maxWidth: '440px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
            padding: '2.5rem 2rem',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="/logo.png"
              alt="Aftab Clinic Logo"
              style={{ height: '70px', width: 'auto', marginBottom: '1.25rem', objectFit: 'contain' }}
            />
            <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-blue)', fontWeight: 700 }}>
              Create Account
            </h2>
          </div>

          {isSuccess ? (
            <div
              className="fade-in"
              style={{
                backgroundColor: 'var(--success-bg)',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 size={48} color="var(--primary-green)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>Registration Successful!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', marginBottom: '1rem' }}>
                Your account for <strong>{email}</strong> has been created. Redirecting to login page...
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--primary-green)' }}
              >
                <span>Go to Sign In</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMessage && (
                <div
                  style={{
                    backgroundColor: 'var(--error-bg)',
                    border: '1px solid #fecaca',
                    color: 'var(--error-red)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <div className="input-wrapper">
                  <UserIcon className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Address or Phone Number */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Email Address or Phone Number (e.g. 03001234567)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Password (at least 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', backgroundColor: 'var(--primary-green)' }}
              >
                <span>Create Account</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* Login Link */}
          {!isSuccess && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{ color: 'var(--primary-blue)', fontWeight: 600, textDecoration: 'none' }}
              >
                Sign In here
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
