import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = 'forgot-password-body';
    return () => {
      document.body.className = '';
    };
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailValue = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailValue === '') {
      showToast('Please enter your registered email address');
      return;
    }

    if (!emailPattern.test(emailValue)) {
      showToast('Please enter a valid email address');
      return;
    }

    setIsSending(true);

    try {
      const res = await api.forgotPassword(emailValue);
      setIsSending(false);

      if (res && res.success) {
        sessionStorage.setItem('educonnect_reset_email', emailValue);
        sessionStorage.setItem('educonnect_otp_purpose', 'reset');
        showToast(res?.message || 'Verification code sent to your email!', 'success');
        setTimeout(() => {
          navigate(`/otp?purpose=reset&email=${encodeURIComponent(emailValue)}`);
        }, 1000);
      } else {
        showToast(res?.message || 'Failed to send reset code. Please check your email.', 'error');
      }
    } catch {
      setIsSending(false);
      showToast('Server connection error. Please try again.', 'error');
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
            <i className="ri-lock-password-line"></i>
          </div>
          <h2>Forgot Password?</h2>
          <p>
            No worries! Enter your registered account email and we will send you a 6-digit verification code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="input-label">Email Address</label>
            <div className="input-field">
              <i className="ri-mail-line field-icon"></i>
              <input
                type="email"
                placeholder="e.g. student@educonnect.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSending}>
            {isSending ? (
              <span className="btn-loading">
                <i className="ri-loader-4-line spin-icon"></i> Sending OTP...
              </span>
            ) : (
              <span className="btn-content">
                Send Verification Code
                <i className="ri-arrow-right-line"></i>
              </span>
            )}
          </button>

          <div className="form-footer-action">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="register-highlight">
                Return to Login
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
