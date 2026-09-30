const db = require('../config/db');

/**
 * GET /api/teachers
 * Fetch all teachers from MySQL with course count, subject, qualification
 */
exports.getTeachers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.mobile, u.dob, u.status, u.is_verified, u.created_at,
              td.subject, td.experience, td.qualification, td.resume, td.approval_status,
              (SELECT COUNT(*) FROM courses c WHERE c.teacher_id = u.id) AS active_courses,
              (SELECT COUNT(*) FROM live_classes lc WHERE lc.teacher_id = u.id) AS total_live_classes
       FROM users u
       LEFT JOIN teacher_details td ON u.id = td.teacher_id
       WHERE u.role = 'Teacher'
       ORDER BY u.created_at DESC`
    );

    return res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch teachers', error: error.message });
  }
};

/**
 * PUT /api/teachers/:id/status
 * Update teacher approval status and user status (Admin only)
 */
exports.updateTeacherStatus = async (req, res) => {
  const { id } = req.params;
  const { status, approvalStatus } = req.body;

  try {
    if (status) {
      await db.query('UPDATE users SET status = ? WHERE id = ? AND role = "Teacher"', [status, id]);
    }

    if (approvalStatus) {
      await db.query('UPDATE teacher_details SET approval_status = ? WHERE teacher_id = ?', [approvalStatus, id]);
    }

    return res.status(200).json({ success: true, message: 'Teacher status updated successfully' });
  } catch (error) {
    console.error('Error updating teacher status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update teacher status', error: error.message });
  }
};

/**
 * DELETE /api/teachers/:id
 * Delete teacher (Admin only). Preserves permanent demo user teacher@educonnect.com.
 */
exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const [userRows] = await db.query('SELECT email FROM users WHERE id = ?', [id]);
    if (userRows.length > 0 && userRows[0].email === 'teacher@educonnect.com') {
      return res.status(403).json({ success: false, message: 'Permanent demo teacher account cannot be deleted' });
    }

    await db.query('DELETE FROM teacher_details WHERE teacher_id = ?', [id]);
    await db.query('DELETE FROM users WHERE id = ? AND role = "Teacher"', [id]);

    return res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete teacher', error: error.message });
  }
};
