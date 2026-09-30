const db = require('../config/db');
const { sendVerificationOtpEmail } = require('../utils/emailService');

/**
 * GET /api/notifications
 * Fetch all notifications for the authenticated Admin from MySQL
 */
exports.getNotifications = async (req, res) => {
  try {
    const adminId = req.user.id;

    const [rows] = await db.query(
      `SELECT n.id, n.user_id, n.title, n.message, n.type, n.is_read, n.applicant_id, n.created_at,
              u.name AS applicant_name, u.email AS applicant_email, u.role AS applicant_role, u.status AS applicant_status
       FROM notifications n
       LEFT JOIN users u ON n.applicant_id = u.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC`,
      [adminId]
    );

    const [countRows] = await db.query(
      'SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = 0',
      [adminId]
    );

    const unreadCount = countRows[0]?.unreadCount || 0;

    return res.status(200).json({
      success: true,
      unreadCount,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for the authenticated Admin
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const adminId = req.user.id;
    const [rows] = await db.query(
      'SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = 0',
      [adminId]
    );
    return res.status(200).json({
      success: true,
      unreadCount: rows[0]?.unreadCount || 0
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, adminId]
    );

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message
    });
  }
};

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for Admin
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const adminId = req.user.id;
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [adminId]
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message
    });
  }
};

/**
 * GET /api/notifications/registrations/:applicantId
 * Get detailed profile of a registration request (never exposing password/secrets)
 */
exports.getRegistrationDetails = async (req, res) => {
  try {
    const { applicantId } = req.params;

    const [userRows] = await db.query(
      'SELECT id, name, email, mobile, dob, role, profile_photo, status, is_verified, created_at FROM users WHERE id = ?',
      [applicantId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration application not found'
      });
    }

    const applicant = userRows[0];
    let roleDetails = null;

    if (applicant.role === 'Student') {
      const [sRows] = await db.query(
        'SELECT grade_level, interests, created_at FROM student_details WHERE student_id = ?',
        [applicantId]
      );
      if (sRows.length > 0) roleDetails = sRows[0];
    } else if (applicant.role === 'Teacher') {
      const [tRows] = await db.query(
        'SELECT subject, experience, qualification, resume, approval_status, created_at FROM teacher_details WHERE teacher_id = ?',
        [applicantId]
      );
      if (tRows.length > 0) roleDetails = tRows[0];
    }

    return res.status(200).json({
      success: true,
      applicant: {
        ...applicant,
        details: roleDetails
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch registration details',
      error: error.message
    });
  }
};

/**
 * POST /api/notifications/registrations/:applicantId/approve
 * Admin approves pending registration: sets status='Approved', generates 6-digit OTP, sends via email
 */
exports.approveRegistration = async (req, res) => {
  try {
    const { applicantId } = req.params;

    const [userRows] = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [applicantId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    const applicant = userRows[0];

    if (applicant.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Applicant account is already active'
      });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update status to Approved with OTP and 10-minute expiration
    await db.query(
      `UPDATE users 
       SET status = 'Approved', 
           verification_otp = ?, 
           verification_otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
           otp_attempts = 0 
       WHERE id = ?`,
      [otp, applicantId]
    );

    // If teacher, update teacher_details approval_status
    if (applicant.role === 'Teacher') {
      await db.query(
        "UPDATE teacher_details SET approval_status = 'Approved' WHERE teacher_id = ?",
        [applicantId]
      );
    }

    // Mark Admin's registration request notification as read
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE applicant_id = ? AND type = 'registration'",
      [applicantId]
    );

    // Create applicant notification (scoped to applicant)
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, is_read, applicant_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        applicantId,
        'Registration Approved',
        'Your registration request has been approved. A 6-digit OTP has been sent to your registered email.',
        'registration_approval',
        0,
        applicantId
      ]
    );

    // Send verification email to applicant
    const emailResult = await sendVerificationOtpEmail(applicant.email, applicant.name, otp);

    return res.status(200).json({
      success: true,
      message: 'Registration approved successfully. Verification code sent to applicant email.',
      emailDelivery: emailResult.sent ? 'sent' : emailResult.message
    });
  } catch (error) {
    console.error('Approval error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve registration',
      error: error.message
    });
  }
};

/**
 * POST /api/notifications/registrations/:applicantId/reject
 * Admin rejects pending registration
 */
exports.rejectRegistration = async (req, res) => {
  try {
    const { applicantId } = req.params;

    const [userRows] = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [applicantId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    const applicant = userRows[0];

    if (applicant.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already active account'
      });
    }

    // Update status to Rejected and clear any OTP
    await db.query(
      `UPDATE users 
       SET status = 'Rejected', 
           verification_otp = NULL, 
           verification_otp_expiry = NULL 
       WHERE id = ?`,
      [applicantId]
    );

    if (applicant.role === 'Teacher') {
      await db.query(
        "UPDATE teacher_details SET approval_status = 'Rejected' WHERE teacher_id = ?",
        [applicantId]
      );
    }

    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE applicant_id = ? AND type = 'registration'",
      [applicantId]
    );

    // Create applicant notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, is_read, applicant_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        applicantId,
        'Registration Rejected',
        'Your registration request has been rejected by an administrator.',
        'registration_rejection',
        0,
        applicantId
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Registration rejected.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject registration',
      error: error.message
    });
  }
};

/**
 * DELETE /api/notifications/registrations/:applicantId
 * Admin permanently deletes a pending/rejected registration
 */
exports.deletePendingRegistration = async (req, res) => {
  try {
    const { applicantId } = req.params;

    const [userRows] = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [applicantId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    const applicant = userRows[0];

    // Do NOT allow deleting Active users via this endpoint
    if (applicant.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete Active users through registration management. Use student/teacher management.'
      });
    }

    // Delete related details
    if (applicant.role === 'Student') {
      await db.query('DELETE FROM student_details WHERE student_id = ?', [applicantId]);
    } else if (applicant.role === 'Teacher') {
      await db.query('DELETE FROM teacher_details WHERE teacher_id = ?', [applicantId]);
    }

    // Delete associated notifications
    await db.query('DELETE FROM notifications WHERE applicant_id = ?', [applicantId]);

    // Delete from users table so email can register again
    await db.query('DELETE FROM users WHERE id = ?', [applicantId]);

    return res.status(200).json({
      success: true,
      message: 'Pending registration deleted successfully.'
    });
  } catch (error) {
    console.error('Delete pending error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete pending registration',
      error: error.message
    });
  }
};
