import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { playNotificationSound, initAudioUnlock } from '../utils/audio';
import './RegisterPage.css';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState('Student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Teacher specific fields
  const [subject, setSubject] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');

  // Two-stage flow states: 'FORM' | 'WAITING'
  const [stage, setStage] = useState('FORM');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [approvalNotification, setApprovalNotification] = useState(null);
  const [showResumeInput, setShowResumeInput] = useState(false);
  const [resumeEmailInput, setResumeEmailInput] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Fresh vs Resume detection
  useEffect(() => {
    document.body.className = 'register-body';
    initAudioUnlock();

    const searchParams = new URLSearchParams(location.search);
    const isResume = searchParams.get('resume') === 'true';
    const resumeEmail = searchParams.get('email');

    if (isResume) {
      const emailToResume = resumeEmail || sessionStorage.getItem('educonnect_pending_reg_email');
      if (emailToResume) {
        setSubmittedEmail(emailToResume);
        checkStatusDirectly(emailToResume);
      }
    } else {
      // Intentionally fresh registration: clean stale registration session keys
      sessionStorage.removeItem('educonnect_pending_reg_email');
      sessionStorage.removeItem('educonnect_verify_email');
      sessionStorage.removeItem('educonnect_otp_purpose');
      setStage('FORM');
      setSubmittedEmail('');
      setMaskedEmail('');
      setApprovalNotification(null);
    }

    return () => {
      document.body.className = '';
    };
  }, [location.search]);

  // Polling for Admin approval while on WAITING stage
  useEffect(() => {
    if (stage !== 'WAITING' || !submittedEmail) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await api.getRegistrationStatus(submittedEmail);
        if (!isMounted || !res || !res.success) return;

        if (res.maskedEmail) setMaskedEmail(res.maskedEmail);

        if (res.status === 'Approved' || res.isApproved || res.isOtpRequired) {
          playNotificationSound(`applicant_approval_${submittedEmail}`);
          const notif = res.notification || {
            title: 'Registration Approved',
            message: 'Your registration request has been approved. A 6-digit OTP has been sent to your registered email.'
          };
          setApprovalNotification(notif);
          sessionStorage.setItem('educonnect_verify_email', submittedEmail);
          sessionStorage.setItem('educonnect_otp_purpose', 'registration');
          showToast('Registration Approved! Navigating to verification page...', 'success');
          
          // Replace history entry to prevent back-button loops
          setTimeout(() => {
            navigate(`/otp?purpose=registration&email=${encodeURIComponent(submittedEmail)}`, { replace: true });
          }, 1000);
        } else if (res.status === 'Rejected') {
          showToast('Your registration request was rejected by an administrator.', 'error');
          setApprovalNotification(res.notification || { title: 'Registration Rejected', message: 'Admin rejected your registration request.' });
        }
      } catch {
        // Polling error ignored
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [stage, submittedEmail, navigate]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const checkStatusDirectly = async (emailToCheck) => {
    try {
      const res = await api.getRegistrationStatus(emailToCheck);
      if (res && res.success) {
        if (res.maskedEmail) setMaskedEmail(res.maskedEmail);
        if (res.status === 'Pending') {
          setStage('WAITING');
        } else if (res.status === 'Approved' || res.isApproved || res.isOtpRequired) {
          setApprovalNotification(res.notification || {
            title: 'Registration Approved',
            message: 'Your registration request has been approved. A 6-digit OTP has been sent to your registered email.'
          });
          sessionStorage.setItem('educonnect_verify_email', emailToCheck);
          sessionStorage.setItem('educonnect_otp_purpose', 'registration');
          showToast('Registration Approved! Opening verification screen...', 'success');
          navigate(`/otp?purpose=registration&email=${encodeURIComponent(emailToCheck)}`, { replace: true });
        }
      }
    } catch {
      // Ignore
    }
  };

  const calculateStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (score === 0) {
      return { width: '0%', background: '#64748b', text: 'Enter password' };
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

  const strength = calculateStrength(password);

  // Form submission: Request for Admin Approval
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim() === '') {
      showToast('Please enter your full name');
      return;
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(email.trim())) {
      showToast('Please enter a valid email address');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      showToast('Please enter a valid 10-digit mobile number');
      return;
    }

    if (dob === '') {
      showToast('Please select your date of birth');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    if (!terms) {
      showToast('Please agree to terms & conditions');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        mobile: mobile.trim(),
        dob,
        subject: selectedRole === 'Teacher' ? subject.trim() : null,
        experience: selectedRole === 'Teacher' ? experience.trim() : null,
        qualification: selectedRole === 'Teacher' ? qualification.trim() : null
      });

      setLoading(false);

      if (res && res.success) {
        const userEmail = email.trim();
        setSubmittedEmail(userEmail);
        sessionStorage.setItem('educonnect_pending_reg_email', userEmail);
        sessionStorage.setItem('educonnect_verify_email', userEmail);
        sessionStorage.setItem('educonnect_otp_purpose', 'registration');
        showToast('Registration request submitted successfully. Waiting for Admin approval.', 'success');
        setStage('WAITING');
      } else {
        showToast(res?.message || 'Registration failed. Try a different email.');
      }
    } catch {
      setLoading(false);
      showToast('Server connection error. Please try again.');
    }
  };

  const handleStartNewApplication = () => {
    sessionStorage.removeItem('educonnect_pending_reg_email');
    sessionStorage.removeItem('educonnect_verify_email');
    sessionStorage.removeItem('educonnect_otp_purpose');
    setStage('FORM');
    setSubmittedEmail('');
    setMaskedEmail('');
    setApprovalNotification(null);
    setName('');
    setEmail('');
    setMobile('');
    setDob('');
    setPassword('');
    setConfirmPassword('');
    setSubject('');
    setExperience('');
    setQualification('');
    navigate('/register', { replace: true });
  };

  return (
    <div className="register-wrapper">
      {/* Dynamic Ambient Background Glows */}
      <div className="register-ambient">
        <div className="ambient-sphere sphere-1"></div>
        <div className="ambient-sphere sphere-2"></div>
        <div className="ambient-sphere sphere-3"></div>
      </div>

      <div className="register-container">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="register-left">
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
              Join Next-Gen Campus
            </div>
            <h1 className="welcome-title">
              Start Your <br />
              <span className="gradient-highlight">Learning Journey</span>
            </h1>
            <p className="welcome-desc">
              Connect with world-class mentors, interactive courses, live video classrooms, and an empowering educational community.
            </p>

            <div className="feature-bullets">
              <div className="feature-bullet-item">
                <div className="bullet-icon">
                  <i className="ri-shield-check-fill"></i>
                </div>
                <div>
                  <h4>Verified Community</h4>
                  <p>All students and instructors undergo administrator verification.</p>
                </div>
              </div>
              <div className="feature-bullet-item">
                <div className="bullet-icon">
                  <i className="ri-video-chat-fill"></i>
                </div>
                <div>
                  <h4>Live Interactive Classes</h4>
                  <p>HD video sessions, whiteboard collaboration, and recorded lectures.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="left-footer">
            <p>&copy; 2026 EduConnect Pro. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side: Flow Form or Waiting Screen */}
        <div className="register-right">
          {/* ==========================================================
              STAGE 1: REGISTRATION FORM
             ========================================================== */}
          {stage === 'FORM' && (
            <div className="form-content">
              <div className="form-header">
                <h2>Create Account</h2>
                <p>Select your campus role and fill in your details to apply.</p>
              </div>

              {/* Role Selector Pills */}
              <div className="role-pills-row">
                <button
                  type="button"
                  className={`pill-btn ${selectedRole === 'Student' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('Student')}
                >
                  <i className="ri-user-smile-line"></i>
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  className={`pill-btn ${selectedRole === 'Teacher' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('Teacher')}
                >
                  <i className="ri-book-read-line"></i>
                  <span>Teacher</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="input-label">Full Name</label>
                  <div className="input-field">
                    <i className="ri-user-line field-icon"></i>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-field">
                    <i className="ri-mail-line field-icon"></i>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="input-label">Mobile Number</label>
                    <div className="input-field">
                      <i className="ri-phone-line field-icon"></i>
                      <input
                        type="tel"
                        placeholder="10 digit number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Date of Birth</label>
                    <div className="input-field">
                      <i className="ri-calendar-line field-icon"></i>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Teacher specific fields */}
                {selectedRole === 'Teacher' && (
                  <div className="teacher-fields-block">
                    <div className="form-group">
                      <label className="input-label">Subject Specialization</label>
                      <div className="input-field">
                        <i className="ri-book-open-line field-icon"></i>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science, Mathematics"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required={selectedRole === 'Teacher'}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="input-label">Teaching Experience</label>
                        <div className="input-field">
                          <i className="ri-briefcase-line field-icon"></i>
                          <input
                            type="text"
                            placeholder="e.g. 5 Years"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            required={selectedRole === 'Teacher'}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="input-label">Highest Qualification</label>
                        <div className="input-field">
                          <i className="ri-award-line field-icon"></i>
                          <input
                            type="text"
                            placeholder="e.g. M.Tech, Ph.D."
                            value={qualification}
                            onChange={(e) => setQualification(e.target.value)}
                            required={selectedRole === 'Teacher'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="input-label">Password</label>
                  <div className="input-field">
                    <i className="ri-lock-password-line field-icon"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                </div>

                {password && (
                  <div className="strength-meter-wrap">
                    <div className="strength-meter-bar">
                      <div
                        className="strength-meter-fill"
                        style={{ width: strength.width, backgroundColor: strength.background }}
                      ></div>
                    </div>
                    <span className="strength-text" style={{ color: strength.background }}>
                      {strength.text}
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label className="input-label">Confirm Password</label>
                  <div className="input-field">
                    <i className="ri-lock-check-line field-icon"></i>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle eye-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                </div>

                <div className="terms-row">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                    />
                    <span className="terms-text">
                      I agree to the <a href="#terms" className="link-terms">Terms of Service</a> & <a href="#privacy" className="link-terms">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                {/* Main Action Button */}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading">
                      <i className="ri-loader-4-line spin-icon"></i> Submitting Request...
                    </span>
                  ) : (
                    <span className="btn-content">
                      Request for Admin Approval
                      <i className="ri-arrow-right-line"></i>
                    </span>
                  )}
                </button>

                <div className="form-footer-action">
                  <p>
                    Already have an account?{' '}
                    <Link to="/login" className="register-highlight">
                      Sign In
                    </Link>
                  </p>
                  {showResumeInput ? (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                        Enter your registration email to check status:
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="email"
                          placeholder="your-email@example.com"
                          value={resumeEmailInput}
                          onChange={(e) => setResumeEmailInput(e.target.value)}
                          style={{
                            flex: 1,
                            height: '36px',
                            padding: '0 10px',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = resumeEmailInput.trim();
                            if (trimmed) {
                              setSubmittedEmail(trimmed);
                              checkStatusDirectly(trimmed);
                            } else {
                              showToast('Please enter an email address');
                            }
                          }}
                          style={{
                            background: '#4f46e5',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Check
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResumeInput(false)}
                          style={{
                            background: 'transparent',
                            color: '#94a3b8',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '8px',
                            padding: '0 10px',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                      Already submitted a request?{' '}
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#818cf8',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                        onClick={() => setShowResumeInput(true)}
                      >
                        Check Status / Resume
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ==========================================================
              STAGE 2: WAITING FOR ADMIN APPROVAL
             ========================================================== */}
          {stage === 'WAITING' && (
            <div className="form-content" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="form-header">
                <h2>Request Submitted</h2>
                <p>Your registration request is currently in review.</p>
              </div>

              {approvalNotification && (
                <div 
                  className="applicant-approval-alert"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '14px',
                    padding: '16px',
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    animation: 'fadeIn 0.3s ease'
                  }}
                >
                  <h4 style={{ color: '#34d399', margin: '0 0 6px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <i className="ri-checkbox-circle-fill"></i>
                    {approvalNotification.title || 'Registration Approved'}
                  </h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 12px 0' }}>
                    {approvalNotification.message || 'Your registration request has been approved. A 6-digit OTP has been sent to your registered email.'}
                  </p>
                  <button
                    type="button"
                    className="submit-btn"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
                      padding: '10px 20px'
                    }}
                    onClick={() => navigate(`/otp?purpose=registration&email=${encodeURIComponent(submittedEmail)}`, { replace: true })}
                  >
                    Enter Verification OTP
                    <i className="ri-arrow-right-line" style={{ marginLeft: '6px' }}></i>
                  </button>
                </div>
              )}

              <div className="approval-waiting-card">
                <div className="waiting-pulse-icon">
                  <i className="ri-time-line"></i>
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  Waiting for Admin Approval
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  Registration request submitted successfully. Waiting for Admin approval. Once an administrator approves your application, a 6-digit OTP will be dispatched to your registered email.
                </p>

                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'inline-block',
                  color: '#818cf8',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginBottom: '1rem'
                }}>
                  <i className="ri-mail-line" style={{ marginRight: '6px' }}></i>
                  {maskedEmail || submittedEmail}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                  <i className="ri-loader-4-line spin-icon"></i>
                  <span>Live status checking active...</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="submit-btn"
                  style={{ flex: 1 }}
                  onClick={() => checkStatusDirectly(submittedEmail)}
                >
                  <i className="ri-refresh-line" style={{ marginRight: '6px' }}></i>
                  Check Status Now
                </button>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '14px',
                    cursor: 'pointer'
                  }}
                  onClick={handleStartNewApplication}
                >
                  Start New Application
                </button>
              </div>

              <div className="form-footer-action" style={{ marginTop: '2rem' }}>
                <p>
                  Return to{' '}
                  <Link to="/login" className="register-highlight">
                    Login Page
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Modern Toast */}
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
