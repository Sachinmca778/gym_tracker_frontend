import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MembersPage from './pages/members/MembersPage';
import MemberDetailPage from './pages/members/MemberDetailPage';
import TrainersPage from './pages/trainers/TrainersPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import AttendancePage from './pages/attendance/AttendancePage';
import MembershipsPage from './pages/memberships/MembershipsPage';
import GymsPage from './pages/gyms/GymsPage';
import ProfilePage from './pages/profile/ProfilePage';
import StorePage from './pages/store/StorePage';
import './styles/globals.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: 'var(--shadow-glow)' }}>
          <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', width: 22, height: 22 }} />
        </div>
        <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Loading...</div>
      </div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><Layout><MembersPage /></Layout></ProtectedRoute>} />
      <Route path="/members/:id" element={<ProtectedRoute><Layout><MemberDetailPage /></Layout></ProtectedRoute>} />
      <Route path="/trainers" element={<ProtectedRoute><Layout><TrainersPage /></Layout></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Layout><PaymentsPage /></Layout></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Layout><AttendancePage /></Layout></ProtectedRoute>} />
      <Route path="/memberships" element={<ProtectedRoute><Layout><MembershipsPage /></Layout></ProtectedRoute>} />
      <Route path="/gyms" element={<ProtectedRoute><Layout><GymsPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/store" element={<StorePage />} />

    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-normal)',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: 'var(--bg-card)' },
              style: { borderColor: 'rgba(16,185,129,0.3)' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'var(--bg-card)' },
              style: { borderColor: 'rgba(239,68,68,0.3)' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
