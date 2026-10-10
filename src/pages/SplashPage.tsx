import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 2-second splash screen transition
    const intervalTime = 20; // 20ms * 100 steps = 2000ms (2 seconds)
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigate('/login', { replace: true });
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative backdrop glow */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,86,179,0.08) 0%, rgba(0,168,89,0.05) 50%, rgba(255,255,255,0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="fade-in pulse-glow"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        {/* Official Logo Image */}
        <img
          src="/logo.png"
          alt="Aftab Clinic Diagnostic Laboratory Logo"
          style={{
            width: '240px',
            height: 'auto',
            maxHeight: '240px',
            objectFit: 'contain',
            marginBottom: '1.5rem',
          }}
        />

        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            maxWidth: '380px',
            marginTop: '0.25rem',
            marginBottom: '2rem',
          }}
        >
          Medical Testing & Diagnostic Laboratory
        </p>

        {/* 2-Second Progress Bar */}
        <div
          style={{
            width: '260px',
            height: '6px',
            backgroundColor: 'var(--border-light)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--primary-blue)',
              backgroundImage: 'linear-gradient(90deg, var(--primary-blue) 0%, var(--primary-green) 100%)',
              transition: 'width 0.02s linear',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--primary-green)',
            fontWeight: 600,
            marginBottom: '2rem',
          }}
        >
          <ShieldCheck size={16} /> Precision Testing • Accredited Quality
        </div>

        {/* Quick Skip Option */}
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="btn btn-outline"
          style={{
            fontSize: '0.8125rem',
            padding: '0.375rem 1rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <span>Continue to Login</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        Aftab Clinic Diagnostic Laboratory Portal • Stage 1 Prototype
      </div>
    </div>
  );
};
