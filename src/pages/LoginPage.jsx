import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [otpActionEmail, setOtpActionEmail] = useState('');

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = 'login-body';
    const flash = sessionStorage.getItem('login_flash_message');
    if (flash) {
      showToast(flash, 'success');
      sessionStorage.removeItem('login_flash_message');
    }

    const savedPending = sessionStorage.getItem('educonnect_pending_reg_email');
    if (savedPending) {
      api.getRegistrationStatus(savedPending).then((res) => {
        if (res && res.success && (res.status === 'Approved' || res.isApproved) && !res.isOtpVerified) {
          setOtpActionEmail(savedPending);
        }
      }).catch(() => {});
    }

    return () => {
      document.body.className = '';
    };
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const fillDemoAccount = (role) => {
    setSelectedRole(role);
    if (role === 'Admin') {
      setEmail('admin@educonnect.com');
      setPassword('Password123');
      showToast('Filled Admin demo credentials', 'info');
    } else if (role === 'Teacher') {
      setEmail('teacher@educonnect.com');
      setPassword('Password123');
      showToast('Filled Teacher demo credentials', 'info');
    } else {
      setEmail('student@educonnect.com');
      setPassword('Password123');
      showToast('Filled Student demo credentials', 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedEmail === '') {
      showToast('Please enter your email address', 'error');
      return;
    }

    if (trimmedPassword === '') {
      showToast('Please enter your password', 'error');
      return;
    }

    if (trimmedPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login(trimmedEmail, trimmedPassword, selectedRole);
      setLoading(false);

      if (res && res.success && res.token && res.user) {
        authLogin(res.user, res.token);
        const authenticatedRole = res.user.role;
        showToast(`Welcome back, ${res.user.name || 'User'}! Signed in as ${authenticatedRole}.`, 'success');

        setTimeout(() => {
          if (authenticatedRole === 'Student') {
            navigate('/student/dashboard');
          } else if (authenticatedRole === 'Teacher') {
            navigate('/teacher/dashboard');
          } else if (authenticatedRole === 'Admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 900);
      } else {
        if (res?.message && (res.message.toLowerCase().includes('approved') || res.message.toLowerCase().includes('otp'))) {
          setOtpActionEmail(trimmedEmail);
        }
        showToast(res?.message || 'Login failed. Please check your credentials.', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Server connection error. Please try again.', 'error');
    }
  };

  return (
    <div className="login-wrapper">
      {/* Dynamic Ambient Background Glows */}
      <div className="login-ambient">
        <div className="ambient-sphere sphere-1"></div>
        <div className="ambient-sphere sphere-2"></div>
        <div className="ambient-sphere sphere-3"></div>
      </div>

      <div className="login-container">
        {/* Left Side: Brand Showcase & Role Picker */}
        <div className="login-left">
          <Link to="/" className="brand-badge">
            <div className="brand-icon">
              <i className="ri-graduation-cap-fill"></i>
            </div>
            <div className="brand-text">
              <span>EduConnect</span>
              <span className="brand-pro">PRO</span>
            </div>
          </Link>

          <div className="left-content">
            <div className="headline-tag">
              <span className="pulse-dot"></span>
              Portal Access
            </div>
            <h1 className="welcome-title">
              Welcome back to <br />
              <span className="gradient-highlight">Smart Learning</span>
            </h1>
            <p className="welcome-subtitle">
              Choose your role below to access your courses, live classroom sessions, and personalized dashboard.
            </p>

            {/* Role Cards */}
            <div className="role-selector-label">SELECT YOUR ROLE</div>
            <div className="role-selector-grid">
              <button
                type="button"
                className={`role-btn ${selectedRole === 'Student' ? 'active' : ''}`}
                onClick={() => handleRoleClick('Student')}
              >
                <div className="role-btn-icon student-icon">
                  <i className="ri-graduation-cap-line"></i>
                </div>
                <div className="role-btn-info">
                  <span className="role-name">Student</span>
                  <span className="role-desc">Learn & explore</span>
                </div>
                {selectedRole === 'Student' && <i className="ri-checkbox-circle-fill check-icon"></i>}
              </button>

              <button
                type="button"
                className={`role-btn ${selectedRole === 'Teacher' ? 'active' : ''}`}
                onClick={() => handleRoleClick('Teacher')}
              >
                <div className="role-btn-icon teacher-icon">
                  <i className="ri-user-star-line"></i>
                </div>
                <div className="role-btn-info">
                  <span className="role-name">Teacher</span>
                  <span className="role-desc">Teach & manage</span>
                </div>
                {selectedRole === 'Teacher' && <i className="ri-checkbox-circle-fill check-icon"></i>}
              </button>

              <button
                type="button"
                className={`role-btn ${selectedRole === 'Admin' ? 'active' : ''}`}
                onClick={() => handleRoleClick('Admin')}
              >
                <div className="role-btn-icon admin-icon">
                  <i className="ri-shield-flash-line"></i>
                </div>
                <div className="role-btn-info">
                  <span className="role-name">Admin</span>
                  <span className="role-desc">System controls</span>
                </div>
                {selectedRole === 'Admin' && <i className="ri-checkbox-circle-fill check-icon"></i>}
              </button>
            </div>

            {/* Quick Demo Login Bar */}
            <div className="demo-accounts-card">
              <div className="demo-header">
                <i className="ri-flashlight-fill"></i>
                <span>1-Click Demo Login:</span>
              </div>
              <div className="demo-buttons">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('Student')}
                  className="demo-pill"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('Teacher')}
                  className="demo-pill"
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('Admin')}
                  className="demo-pill"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>

          <div className="left-footer">
            <Link to="/" className="back-link">
              <i className="ri-arrow-left-line"></i> Back to Homepage
            </Link>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="login-right">
          <div className="form-card">
            <div className="form-header">
              <div className="form-role-badge">
                <span className="active-dot"></span>
                Logging in as <strong>{selectedRole}</strong>
              </div>
              <h2 className="form-title">Account Sign In</h2>
              <p className="form-subtitle">Enter your registered email and password to proceed.</p>
            </div>

            {otpActionEmail && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                  <i className="ri-checkbox-circle-fill" style={{ marginRight: '6px' }}></i>
                  Registration Approved!
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0 0 10px 0' }}>
                  Your registration request has been approved. Please enter your 6-digit OTP to complete registration.
                </p>
                <button
                  type="button"
                  className="submit-btn"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    boxShadow: '0 6px 16px -4px rgba(16, 185, 129, 0.4)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    sessionStorage.setItem('educonnect_verify_email', otpActionEmail);
                    sessionStorage.setItem('educonnect_otp_purpose', 'registration');
                    navigate(`/otp?purpose=registration&email=${encodeURIComponent(otpActionEmail)}`, { replace: true });
                  }}
                >
                  Enter Verification OTP
                  <i className="ri-arrow-right-line" style={{ marginLeft: '6px' }}></i>
                </button>
              </div>
            )}

            <form id="loginForm" onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="input-label" htmlFor="login-email">Email Address</label>
                <div className="input-field">
                  <i className="ri-mail-line field-icon"></i>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="e.g. name@educonnect.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="input-label" htmlFor="login-password">Password</label>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-field">
                  <i className="ri-lock-2-line field-icon"></i>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                  </button>
                </div>
              </div>

              <div className="form-extra">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">Keep me signed in for 30 days</span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <i className="ri-loader-4-line spin-icon"></i> Authenticating...
                  </span>
                ) : (
                  <span className="btn-content">
                    Sign In to {selectedRole} Portal
                    <i className="ri-arrow-right-line"></i>
                  </span>
                )}
              </button>

              <div className="form-divider">
                <span>or</span>
              </div>

              <div className="form-footer-action">
                <p>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="register-highlight"
                    onClick={() => {
                      sessionStorage.removeItem('educonnect_pending_reg_email');
                      sessionStorage.removeItem('educonnect_verify_email');
                      sessionStorage.removeItem('educonnect_otp_purpose');
                    }}
                  >
                    Create free account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Modern Toast Notification */}
      {toast && (
        <div className={`modern-toast ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && <i className="ri-checkbox-circle-fill"></i>}
            {toast.type === 'error' && <i className="ri-error-warning-fill"></i>}
            {toast.type === 'info' && <i className="ri-information-fill"></i>}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}
    </div>
  );
}
