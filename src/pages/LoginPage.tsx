import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    const success = login(email, password);
    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const fillDemoUser = () => {
    setEmail('patient@aftabclinic.com');
    setPassword('demoPass123');
    setErrorMessage('');
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
          {/* Official Logo & Portal Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="/logo.png"
              alt="Aftab Clinic Logo"
              style={{ height: '70px', width: 'auto', marginBottom: '1rem', objectFit: 'contain' }}
            />
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-blue)' }}>Sign In to Patient Portal</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Access diagnostic laboratory services & medical test results
            </p>
          </div>

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

          <form onSubmit={handleSubmit}>
            {/* Email / Username Field */}
            <div className="form-group">
              <label className="form-label">Email Address or Username</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="name@example.com or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.875rem',
              backgroundColor: 'var(--primary-blue-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-blue)' }}>
              <CheckCircle2 size={16} />
              <span>Quick Patient Login? Use quick fill.</span>
            </div>
            <button
              type="button"
              onClick={fillDemoUser}
              style={{
                background: 'var(--primary-blue)',
                color: '#fff',
                border: 'none',
                padding: '0.25rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Quick Fill
            </button>
          </div>

          {/* Registration Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account yet?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--primary-green)', fontWeight: 600, textDecoration: 'none' }}
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
