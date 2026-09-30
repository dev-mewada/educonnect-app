import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import './OtpPage.css';

export default function OtpPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramPurpose = searchParams.get('purpose');
  const paramEmail = searchParams.get('email');

  // Strict purpose separation:
  // 1. URL parameter 'purpose' ('reset' or 'registration')
  // 2. Explicit current-flow stored purpose
  // 3. Default to 'registration'
  const purpose = (paramPurpose === 'reset' || paramPurpose === 'registration')
    ? paramPurpose
    : (sessionStorage.getItem('educonnect_otp_purpose') === 'reset' ? 'reset' : 'registration');

  // Strict email resolution by purpose — NEVER mix reset email with registration email
  let defaultEmail = '';
  if (paramEmail && paramEmail.trim() !== '') {
    defaultEmail = paramEmail.trim();
  } else if (purpose === 'reset') {
    defaultEmail = sessionStorage.getItem('educonnect_reset_email') || '';
  } else {
    // Registration purpose
    defaultEmail = sessionStorage.getItem('educonnect_verify_email') ||
                   sessionStorage.getItem('educonnect_pending_reg_email') ||
                   '';
  }

  const [email, setEmail] = useState(defaultEmail);
  const [applicantInfo, setApplicantInfo] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(!defaultEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [toast, setToast] = useState(null);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const targetEmail = email || defaultEmail;
    if (purpose !== 'reset' && targetEmail) {
      sessionStorage.setItem('educonnect_verify_email', targetEmail);
      sessionStorage.setItem('educonnect_otp_purpose', 'registration');
      api.getRegistrationStatus(targetEmail).then((res) => {
        if (res && res.success) {
          setApplicantInfo(res);
          if (res.isOtpVerified) {
            setIsOtpVerified(true);
          }
        }
      }).catch(() => {});
    }
  }, [email, purpose, defaultEmail]);

  useEffect(() => {
    document.body.className = 'otp-body';
    return () => {
      document.body.className = '';
    };
  }, []);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleInputChange = (index, e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = val ? val[val.length - 1] : '';
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendClick = async (e) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      showToast('Please enter your email address first', 'error');
      return;
    }

    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    if (purpose === 'reset') {
      try {
        const res = await api.forgotPassword(targetEmail);
        showToast(res?.message || 'A new 6-digit code has been dispatched.', 'info');
      } catch {
        showToast('Failed to resend code.', 'error');
      }
    } else {
      try {
        const res = await api.resendRegistrationOtp(targetEmail);
        if (res && res.success) {
          showToast(res.message || 'A new 6-digit verification code has been dispatched to your email.', 'info');
        } else {
          showToast(res?.message || 'Failed to dispatch verification code.', 'error');
        }
      } catch {
        showToast('Failed to dispatch verification code.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    const targetEmail = email.trim();
    if (!targetEmail) {
      showToast('Please enter the email address for verification');
      setIsEditingEmail(true);
      return;
    }

    if (fullOtp.length !== 6) {
      showToast('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);

    try {
      if (purpose === 'reset') {
        const res = await api.verifyResetOtp(targetEmail, fullOtp);
        setIsVerifying(false);
        if (res && res.success) {
          sessionStorage.setItem('educonnect_reset_email', targetEmail);
          sessionStorage.setItem('educonnect_reset_otp', fullOtp);
          showToast('Code verified! Proceed to set new password.', 'success');
          setTimeout(() => {
            navigate('/reset-password');
          }, 900);
        } else {
          showToast(res?.message || 'Invalid or expired verification code');
        }
      } else {
        // Registration email verification
        const res = await api.verifyRegistrationOtp(targetEmail, fullOtp);
        setIsVerifying(false);
        if (res && res.success) {
          setIsOtpVerified(true);
          showToast('OTP Verified Successfully', 'success');
        } else {
          showToast(res?.message || 'Invalid or expired verification code');
        }
      }
    } catch {
      setIsVerifying(false);
      showToast('Server connection error. Please try again.');
    }
  };

  const handleFinalRegister = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) return;

    setIsCompleting(true);
    try {
      const res = await api.completeRegistration(targetEmail);
      setIsCompleting(false);
      if (res && res.success) {
        sessionStorage.removeItem('educonnect_verify_email');
        sessionStorage.removeItem('educonnect_pending_reg_email');
        sessionStorage.removeItem('educonnect_otp_purpose');
        showToast('Registration successful. You can now login.', 'success');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1200);
      } else {
        showToast(res?.message || 'Failed to complete registration');
      }
    } catch {
      setIsCompleting(false);
      showToast('Server error completing registration');
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
            <i className={purpose === 'reset' ? 'ri-shield-keyhole-line' : 'ri-mail-check-line'}></i>
          </div>
          <h2>{purpose === 'reset' ? 'Verify Security Code' : 'Verify Email Address'}</h2>
          <p>
            {email ? (
              <>
                Enter the 6-digit code sent to <strong>{email}</strong>.{' '}
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(!isEditingEmail)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4f46e5',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  {isEditingEmail ? 'Done' : 'Change'}
                </button>
              </>
            ) : (
              'Enter your registered email address and 6-digit verification code.'
            )}
          </p>
        </div>

        {purpose !== 'reset' && applicantInfo && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '14px',
              margin: '0 0 1.25rem 0',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <i className="ri-checkbox-circle-fill"></i>
              {applicantInfo.notification?.title || 'Registration Approved'}
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
              {applicantInfo.notification?.message || 'Your registration request has been approved. Enter the 6-digit OTP sent to your email.'}
            </div>
            {applicantInfo.name && (
              <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                Applicant: <strong>{applicantInfo.name}</strong> ({applicantInfo.role})
              </div>
            )}
          </div>
        )}

        {isOtpVerified && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '1rem',
              color: '#34d399',
              fontWeight: 600,
              fontSize: '0.9rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <i className="ri-checkbox-circle-fill"></i>
            OTP Verified Successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isEditingEmail && (
            <div style={{ marginBottom: '16px' }}>
              <input
                type="email"
                placeholder="Enter registered email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  textAlign: 'center'
                }}
                required
              />
            </div>
          )}

          <div className="otp-digit-row">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-digit-input"
              />
            ))}
          </div>

          <div className="resend-row">
            <span>Didn't receive the code?</span>
            {countdown > 0 ? (
              <span className="countdown-text">Resend in <strong>{countdown}s</strong></span>
            ) : (
              <button type="button" onClick={handleResendClick} className="resend-btn">
                Resend Code
              </button>
            )}
          </div>

          {/* For registration flow: Reveal Register button ONLY after OTP verification */}
          {purpose !== 'reset' && isOtpVerified ? (
            <button
              type="button"
              className="submit-btn"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
              }}
              disabled={isCompleting}
              onClick={handleFinalRegister}
            >
              {isCompleting ? (
                <span className="btn-loading">
                  <i className="ri-loader-4-line spin-icon"></i> Activating Account...
                </span>
              ) : (
                <span className="btn-content">
                  Register
                  <i className="ri-arrow-right-line"></i>
                </span>
              )}
            </button>
          ) : (
            <button type="submit" className="submit-btn" disabled={isVerifying}>
              {isVerifying ? (
                <span className="btn-loading">
                  <i className="ri-loader-4-line spin-icon"></i> Verifying Code...
                </span>
              ) : (
                <span className="btn-content">
                  {purpose === 'reset' ? 'Verify & Continue' : 'Verify OTP'}
                  <i className="ri-arrow-right-line"></i>
                </span>
              )}
            </button>
          )}

          <div className="form-footer-action">
            <p>
              {purpose === 'reset' ? (
                <>
                  Entered wrong email?{' '}
                  <Link to="/forgot-password" className="register-highlight">
                    Change Email
                  </Link>
                </>
              ) : (
                <>
                  Need to start over with a different account?{' '}
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#818cf8',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textDecoration: 'underline'
                    }}
                    onClick={() => {
                      sessionStorage.removeItem('educonnect_pending_reg_email');
                      sessionStorage.removeItem('educonnect_verify_email');
                      sessionStorage.removeItem('educonnect_otp_purpose');
                      navigate('/register', { replace: true });
                    }}
                  >
                    Start New Registration
                  </button>
                  <div style={{ marginTop: '10px' }}>
                    Already verified?{' '}
                    <Link to="/login" className="register-highlight">
                      Sign In
                    </Link>
                  </div>
                </>
              )}
            </p>
          </div>
        </form>
      </div>

      {toast && (
        <div className={`modern-toast ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <i className="ri-checkbox-circle-fill"></i>
            ) : toast.type === 'info' ? (
              <i className="ri-information-fill"></i>
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
