import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { LabDataProvider } from './context/LabDataContext';
import { SplashPage } from './pages/SplashPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TestsPage } from './pages/TestsPage';
import { PackagesPage } from './pages/PackagesPage';
import { BookingPage } from './pages/BookingPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

import { isProductionMisconfigured } from './config/firebase';

export const App: React.FC = () => {
  if (isProductionMisconfigured()) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', border: '1px solid #fee2e2' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            ⚠️
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#991b1b', fontSize: '1.25rem' }}>Production Configuration Error</h2>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
            Aftab Clinic is running in production mode, but required Firebase Cloud configuration (<code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_PROJECT_ID</code>) is missing or incomplete.
          </p>
          <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: '#334155', marginBottom: '1rem' }}>
            Production does not fall back to local demo or unauthenticated mock data. Live database and cloud security rules require configured cloud endpoints.
          </div>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>
            Contact the system administrator or check deployment environment variables in your hosting provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <LabDataProvider>
        <BookingProvider>
          <BrowserRouter>
          <Routes>
            {/* 1. Splash Screen */}
            <Route path="/" element={<SplashPage />} />

            {/* 2. Login Page */}
            <Route path="/login" element={<LoginPage />} />

            {/* 3. Registration Page */}
            <Route path="/register" element={<RegisterPage />} />

            {/* 4. Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tests"
              element={
                <ProtectedRoute>
                  <TestsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/packages"
              element={
                <ProtectedRoute>
                  <PackagesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/book"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </LabDataProvider>
  </AuthProvider>
  );
};

export default App;
