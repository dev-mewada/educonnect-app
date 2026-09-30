import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = 'reset-password-body';
    return () => {
      document.body.className = '';
    };
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const calculateStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (score === 0) {
      return { width: '0%', background: '#64748b', text: 'Enter new password' };
    } else if (score === 1) {
      return { width: '25%', background: '#f43f5e', text: 'Weak' };
    } else if (score === 2) {
      return { width: '50%', background: '#f59e0b', text: 'Medium' };
    } else if (score === 3) {
      return { width: '75%', background: '#3b82f6', text: 'Good' };
    } else {
      return { width: '100%', background: '#10b981', text: 'Strong' };
    }
  };

  const strength = calculateStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword === '') {
      showToast('Please enter your new password');
      return;
    }

    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long');
      return;
    }

    if (confirmPassword === '') {
      showToast('Please confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    setIsUpdating(true);

    const email = sessionStorage.getItem('educonnect_reset_email');
    const otp = sessionStorage.getItem('educonnect_reset_otp');

    if (!email || !otp) {
      setIsUpdating(false);
      showToast('Missing verification session. Please request a new verification code.');
      setTimeout(() => {
        navigate('/forgot-password');
      }, 1500);
      return;
    }

    try {
      const res = await api.resetPassword(email, newPassword, otp);
      setIsUpdating(false);

      if (res && res.success) {
        sessionStorage.removeItem('educonnect_reset_email');
        sessionStorage.removeItem('educonnect_reset_otp');
        sessionStorage.setItem('login_flash_message', 'Password reset successful! Please login with your new password.');
        showToast(res?.message || 'Password successfully updated!', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } else {
        showToast(res?.message || 'Failed to update password');
      }
    } catch {
      setIsUpdating(false);
      showToast('Server connection error. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-ambient">
        <div className="ambient-sphere sphere-1"></div>
        <div className="ambient-sphere sphere-2"></div>
      </div>

      <div className="auth-card-single">
        <Link to="/" className="brand-badge centered">
          <div className="brand-icon">
            <i className="ri-graduation-cap-fill"></i>
          </div>
          <div className="brand-text">
            <span>EduConnect</span>
            <span className="brand-pro">PRO</span>
          </div>
        </Link>

        <div className="auth-header-center">
          <div className="icon-badge-lock">
            <i className="ri-key-2-line"></i>
          </div>
          <h2>Create New Password</h2>
          <p>
            Choose a robust, memorable password with at least 8 characters including numbers and symbols.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="input-label">New Password</label>
            <div className="input-field">
              <i className="ri-lock-2-line field-icon"></i>
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <i className={showNewPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
          </div>

          {newPassword && (
            <div className="strength-meter">
              <div className="strength-bar-bg">
                <div
                  className="strength-bar-fill"
                  style={{ width: strength.width, backgroundColor: strength.background }}
                ></div>
              </div>
              <div className="strength-label">
                <span>Strength:</span>
                <strong style={{ color: strength.background }}>{strength.text}</strong>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Confirm New Password</label>
            <div className="input-field">
              <i className="ri-lock-check-line field-icon"></i>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isUpdating}>
            {isUpdating ? (
              <span className="btn-loading">
                <i className="ri-loader-4-line spin-icon"></i> Updating Password...
              </span>
            ) : (
              <span className="btn-content">
                Save & Continue to Sign In
                <i className="ri-arrow-right-line"></i>
              </span>
            )}
          </button>

          <div className="form-footer-action">
            <p>
              Remembered your credentials?{' '}
              <Link to="/login" className="register-highlight">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>

      {toast && (
        <div className={`modern-toast ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <i className="ri-checkbox-circle-fill"></i>
            ) : (
              <i className="ri-error-warning-fill"></i>
            )}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}
    </div>
  );
}
