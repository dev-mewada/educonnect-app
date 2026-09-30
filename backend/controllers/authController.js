const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendPasswordResetOtpEmail, sendVerificationOtpEmail } = require('../utils/emailService');

/**
 * Generate JWT with minimum required identity information (id, role, email)
 */
const generateToken = (id, role, email) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

/**
 * POST /api/auth/register
 * Student and Teacher registrations created with 'Pending' status.
 * Admin registration is blocked.
 * Creates an Admin notification in MySQL notifications table.
 */
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      dob,
      password,
      role = 'Student',
      // Student details
      grade_level,
      interests,
      // Teacher details
      subject,
      experience,
      qualification,
      resume
    } = req.body;

    // 1. Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide full name' });
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide password' });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // 3. Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // 4. Role validation & Admin blocking
    if (role === 'Admin') {
      return res.status(403).json({ success: false, message: 'Public Admin registration is not permitted' });
    }
    if (!['Student', 'Teacher'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified. Allowed roles are Student or Teacher' });
    }

    // 5. Prevent duplicate email registration
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // 6. Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 7. Atomic transaction for users + role details + admin notification
    const connection = await db.getConnection();
    let userId;

    try {
      await connection.beginTransaction();

      // Create user with status 'Pending' and is_verified = 0
      const [userResult] = await connection.query(
        'INSERT INTO users (name, email, mobile, dob, password_hash, role, status, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name.trim(), normalizedEmail, mobile || null, dob || null, passwordHash, role, 'Pending', 0]
      );
      userId = userResult.insertId;

      if (role === 'Student') {
        await connection.query(
          'INSERT INTO student_details (student_id, grade_level, interests) VALUES (?, ?, ?)',
          [userId, grade_level || null, interests || null]
        );
      } else if (role === 'Teacher') {
        await connection.query(
          'INSERT INTO teacher_details (teacher_id, subject, experience, qualification, resume, approval_status) VALUES (?, ?, ?, ?, ?, ?)',
          [
            userId,
            subject || 'General',
            experience || '1 Year',
            qualification || 'Graduate',
            resume || null,
            'Pending'
          ]
        );
      }

      // Find Admin user to associate the notification
      const [adminRows] = await connection.query(
        "SELECT id FROM users WHERE role = 'Admin' ORDER BY id ASC LIMIT 1"
      );
      const adminId = adminRows.length > 0 ? adminRows[0].id : 1;

      // Create Admin Dashboard notification
      const notifTitle = `New ${role} Registration Request`;
      const notifMessage = `${name.trim()} has requested registration as a ${role}.`;

      await connection.query(
        'INSERT INTO notifications (user_id, title, message, type, is_read, applicant_id) VALUES (?, ?, ?, ?, ?, ?)',
        [adminId, notifTitle, notifMessage, 'registration', 0, userId]
      );

      await connection.commit();
    } catch (txErr) {
      await connection.rollback();
      throw txErr;
    } finally {
      connection.release();
    }

    // 8. Safe response (NO JWT is returned because account is Pending Approval)
    return res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully. Waiting for Admin approval.',
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        mobile: mobile || null,
        dob: dob || null,
        role,
        status: 'Pending'
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/login
 * Validates credentials against MySQL using bcrypt.compare.
 * Rejects pending, rejected, or unverified accounts.
 */
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Fetch user by email
    const [rows] = await db.query(
      'SELECT id, name, email, mobile, dob, password_hash, role, profile_photo, status, is_verified FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const user = rows[0];

    // 2. Verify role match if specified
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Registered role is ${user.role}, not ${role}.`
      });
    }

    // 3. Verify password with bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    // 4. Reject Pending, Rejected, or Unverified accounts
    if (user.status === 'Pending') {
      return res.status(403).json({
        success: false,
        message: 'Your registration request is pending administrator approval. Please wait for approval.'
      });
    }

    if (user.status === 'Rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your registration request has been rejected by an administrator.'
      });
    }

    if (user.status === 'Approved' && user.verification_otp !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'Your registration request has been approved. Please verify the 6-digit OTP sent to your email to continue.'
      });
    }

    if (user.status === 'Approved' && user.verification_otp === 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'OTP has been verified. Please complete your registration by clicking Register.'
      });
    }

    if (user.status !== 'Active' || !user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or unverified. Please contact administrator.'
      });
    }

    // 5. Generate JWT token
    const token = generateToken(user.id, user.role, user.email);

    // 6. Safe response without password_hash
    return res.status(200).json({
      success: true,
      message: `${user.role} logged in successfully`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        dob: user.dob,
        profile_photo: user.profile_photo,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/verify-registration-otp
 * Verifies applicant OTP after Admin approval.
 * Does NOT activate account yet. Reveals Register button.
 */
exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and 6-digit verification code'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [rows] = await db.query(
      'SELECT id, name, email, role, status, verification_otp, verification_otp_expiry, is_verified, otp_attempts FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    const user = rows[0];

    if (user.status === 'Active' && user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified and active. Please log in.'
      });
    }

    if (user.status === 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Registration is still pending administrator approval.'
      });
    }

    if (user.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Registration was rejected by an administrator.'
      });
    }

    // Rate limiting attempt protection (max 5 attempts)
    if (user.otp_attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Too many failed verification attempts. Please click Resend OTP for a new verification code.'
      });
    }

    // Verify OTP expiry (10 minutes)
    if (new Date() > new Date(user.verification_otp_expiry)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please click Resend OTP for a new code.'
      });
    }

    // Verify OTP match
    if (!user.verification_otp || user.verification_otp !== String(otp).trim()) {
      await db.query('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = ?', [user.id]);
      return res.status(400).json({
        success: false,
        message: 'Invalid or incorrect verification code. Please check your email and try again.'
      });
    }

    // Mark OTP as verified (Account not activated yet; awaits final Register click)
    await db.query(
      "UPDATE users SET verification_otp = 'VERIFIED', otp_attempts = 0 WHERE id = ?",
      [user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'OTP Verified Successfully',
      email: user.email
    });
  } catch (error) {
    console.error('Registration OTP verification error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/complete-registration
 * Final step: When applicant clicks Register after successful OTP verification
 * Backend validates: request exists, Admin approved it, OTP verified, not expired/rejected/deleted.
 * Activates account and marks registration/email as verified.
 */
exports.completeRegistration = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await db.query(
      'SELECT id, name, email, role, status, verification_otp, is_verified FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    const user = rows[0];

    // a. registration request exists & b. Admin approved it
    if (user.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Registration request must be approved by an administrator before completion.'
      });
    }

    // c. OTP was verified
    if (user.verification_otp !== 'VERIFIED') {
      return res.status(400).json({
        success: false,
        message: 'Please verify the 6-digit OTP sent to your email before completing registration.'
      });
    }

    // d. Request is valid: activate account
    await db.query(
      `UPDATE users 
       SET status = 'Active', 
           is_verified = 1, 
           verification_otp = NULL, 
           verification_otp_expiry = NULL, 
           otp_attempts = 0 
       WHERE id = ?`,
      [user.id]
    );

    // Mark applicant's approval notification as read
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR applicant_id = ?', [user.id, user.id]);

    return res.status(200).json({
      success: true,
      message: 'Registration successful. You can now login.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'Active'
      }
    });
  } catch (error) {
    console.error('Complete registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error completing registration',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/resend-registration-otp
 * Invalidate previous OTP and dispatch a fresh 6-digit OTP with 10-minute expiry
 */
exports.resendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const user = rows[0];

    if (user.status === 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Your registration request is still pending administrator approval.'
      });
    }

    if (user.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Your registration request has been rejected by an administrator.'
      });
    }

    if (user.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified and active. Please log in.'
      });
    }

    // Generate fresh 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Invalidate previous OTP, set 10m expiry, reset attempts
    await db.query(
      `UPDATE users 
       SET verification_otp = ?, 
           verification_otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE), 
           otp_attempts = 0 
       WHERE id = ?`,
      [otp, user.id]
    );

    const emailResult = await sendVerificationOtpEmail(user.email, user.name, otp);

    if (!emailResult || !emailResult.sent) {
      console.error('Registration OTP email delivery failed:', emailResult?.message);
      return res.status(500).json({
        success: false,
        message: emailResult?.message || 'Failed to dispatch verification code email',
        deliveryStatus: 'failed'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched to your email.',
      deliveryStatus: 'sent'
    });
  } catch (error) {
    console.error('Resend OTP error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error resending OTP',
      error: error.message
    });
  }
};

/**
 * GET /api/auth/registration-status?email=...
 * Check real-time registration status for the applicant
 */
exports.getRegistrationStatus = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query parameter is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await db.query(
      'SELECT id, name, email, role, status, verification_otp, is_verified FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    const user = rows[0];

    // Mask email for privacy (e.g. d***a@example.com)
    const parts = user.email.split('@');
    const namePart = parts[0];
    const maskedName = namePart.length > 2
      ? namePart[0] + '*'.repeat(namePart.length - 2) + namePart[namePart.length - 1]
      : namePart[0] + '*';
    const maskedEmail = `${maskedName}@${parts[1]}`;

    // Get applicant notification if available (scoped to applicant, user_id = user.id)
    const [notifs] = await db.query(
      "SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id = ? AND type IN ('registration_approval', 'registration_rejection') ORDER BY created_at DESC LIMIT 1",
      [user.id]
    );

    const isOtpRequired = user.status === 'Approved' && user.verification_otp !== 'VERIFIED';
    const isOtpPending = isOtpRequired;

    return res.status(200).json({
      success: true,
      status: user.status,
      isApproved: user.status === 'Approved' || user.status === 'Active',
      isOtpRequired,
      isOtpPending,
      isOtpVerified: user.verification_otp === 'VERIFIED' || user.status === 'Active',
      name: user.name,
      role: user.role,
      maskedEmail,
      notification: notifs.length > 0 ? notifs[0] : null
    });
  } catch (error) {
    console.error('Registration status check error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error checking registration status',
      error: error.message
    });
  }
};

/**
 * GET /api/auth/me
 * Protected endpoint returning currently authenticated user's profile
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      'SELECT id, name, email, mobile, dob, role, profile_photo, status, is_verified, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];

    let details = null;
    if (user.role === 'Teacher') {
      const [tRows] = await db.query(
        'SELECT subject, experience, qualification, resume, approval_status FROM teacher_details WHERE teacher_id = ?',
        [userId]
      );
      if (tRows.length > 0) details = tRows[0];
    } else if (user.role === 'Student') {
      const [sRows] = await db.query(
        'SELECT grade_level, interests FROM student_details WHERE student_id = ?',
        [userId]
      );
      if (sRows.length > 0) details = sRows[0];
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        ...(details ? { details } : {})
      }
    });
  } catch (error) {
    console.error('GetMe error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Generates 6-digit OTP and sends email (OTP is NEVER returned in response)
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide registered email' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [normalizedEmail]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User with this email not found' });
    }

    const user = existing[0];
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?',
      [resetToken, normalizedEmail]
    );

    // Send password reset email
    const emailResult = await sendPasswordResetOtpEmail(normalizedEmail, user.name, resetToken);

    if (!emailResult || !emailResult.sent) {
      console.error('Password reset email sending failed:', emailResult?.message);
      return res.status(500).json({
        success: false,
        message: emailResult?.message || 'Failed to dispatch password reset code email'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset code has been sent to your email',
      deliveryStatus: 'sent'
    });
  } catch (error) {
    console.error('ForgotPassword error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * POST /api/auth/verify-reset-otp
 * Verifies that the entered 6-digit reset OTP matches and has not expired
 */
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [rows] = await db.query(
      'SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [normalizedEmail, String(otp).trim()]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP verification code' });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error verifying OTP', error: error.message });
  }
};

/**
 * POST /api/auth/reset-password
 * Resets password using verified 6-digit OTP
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email, new password, and OTP' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [rows] = await db.query(
      'SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [normalizedEmail, String(otp).trim()]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP verification code' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await db.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?',
      [passwordHash, normalizedEmail]
    );

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    console.error('ResetPassword error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/auth/change-password
 * Change password for logged-in user (requires current password verification)
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const [userRows] = await db.query(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('ChangePassword error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error changing password',
      error: error.message
    });
  }
};

/**
 * PUT /api/auth/profile
 * Update profile for authenticated user in MySQL
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mobile, dob, subject, experience, qualification, grade_level, interests } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (mobile !== undefined) {
      updates.push('mobile = ?');
      params.push(mobile.trim());
    }
    if (dob !== undefined) {
      updates.push('dob = ?');
      params.push(dob);
    }

    if (updates.length > 0) {
      params.push(userId);
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Role-specific detail updates
    if (req.user.role === 'Teacher') {
      const tUpdates = [];
      const tParams = [];
      if (subject !== undefined) { tUpdates.push('subject = ?'); tParams.push(subject); }
      if (experience !== undefined) { tUpdates.push('experience = ?'); tParams.push(experience); }
      if (qualification !== undefined) { tUpdates.push('qualification = ?'); tParams.push(qualification); }

      if (tUpdates.length > 0) {
        tParams.push(userId);
        await db.query(`UPDATE teacher_details SET ${tUpdates.join(', ')} WHERE teacher_id = ?`, tParams);
      }
    } else if (req.user.role === 'Student') {
      const sUpdates = [];
      const sParams = [];
      if (grade_level !== undefined) { sUpdates.push('grade_level = ?'); sParams.push(grade_level); }
      if (interests !== undefined) { sUpdates.push('interests = ?'); sParams.push(interests); }

      if (sUpdates.length > 0) {
        sParams.push(userId);
        await db.query(`UPDATE student_details SET ${sUpdates.join(', ')} WHERE student_id = ?`, sParams);
      }
    }

    // Fetch updated user
    const [rows] = await db.query(
      'SELECT id, name, email, mobile, dob, role, profile_photo, status, is_verified FROM users WHERE id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: rows[0]
    });
  } catch (error) {
    console.error('UpdateProfile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
};
