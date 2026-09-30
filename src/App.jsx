import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CourseProvider } from './context/CourseContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OtpPage from './pages/OtpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import StudentDashboardPage from './pages/Student/StudentDashboardPage';
import TeacherDashboardPage from './pages/Teacher/TeacherDashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function DashboardDispatcher() {
  const { user } = useAuth();
  if (user?.role === 'Student') {
    return <StudentDashboardPage />;
  }
  if (user?.role === 'Teacher') {
    return <TeacherDashboardPage />;
  }
  return <DashboardPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/otp" element={<OtpPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Role-based & Direct Protected Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardDispatcher />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teacher/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['Teacher']}>
                    <TeacherDashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Router>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
