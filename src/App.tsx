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

export const App: React.FC = () => {
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
