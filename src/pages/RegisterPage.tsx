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
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
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

    const success = register(fullName, email, password);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
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
            maxWidth: '460px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
            padding: '2.5rem 2rem',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <img
              src="/logo.png"
              alt="Aftab Clinic Logo"
              style={{ height: '65px', width: 'auto', marginBottom: '0.75rem', objectFit: 'contain' }}
            />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-blue)' }}>Create Patient Account</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Register for online lab report access & diagnostic booking
            </p>
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
                <span>Go to Login Now</span>
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
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <UserIcon className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Muhammad Ahmad"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="At least 6 characters"
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
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--primary-green)' }}
              >
                <span>Register Account</span>
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
