import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Show clean spinner while backend verifies JWT session
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#090d16', color: '#818cf8' }}>
        <i className="ri-loader-4-line spin-icon" style={{ fontSize: '2.5rem' }}></i>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is specified and does not match, redirect to user's permitted role dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === 'Teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
}
