const db = require('../config/db');

/**
 * GET /api/students
 * Fetch all students from MySQL with enrollment counts and profile details
 */
exports.getStudents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.mobile, u.dob, u.status, u.is_verified, u.created_at,
              sd.grade_level, sd.interests,
              (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id) AS enrolled_courses,
              (SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id) AS attended_classes
       FROM users u
       LEFT JOIN student_details sd ON u.id = sd.student_id
       WHERE u.role = 'Student'
       ORDER BY u.created_at DESC`
    );

    return res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

/**
 * PUT /api/students/:id/status
 * Update student account status (Admin only)
 */
exports.updateStudentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Active', 'Inactive', 'Suspended', 'Pending', 'Approved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE id = ? AND role = "Student"',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({ success: true, message: `Student status updated to ${status}` });
  } catch (error) {
    console.error('Error updating student status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update student status', error: error.message });
  }
};

/**
 * DELETE /api/students/:id
 * Delete student (Admin only). Preserves permanent demo user student@educonnect.com.
 */
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    // Protect permanent demo accounts
    const [userRows] = await db.query('SELECT email FROM users WHERE id = ?', [id]);
    if (userRows.length > 0 && userRows[0].email === 'student@educonnect.com') {
      return res.status(403).json({ success: false, message: 'Permanent demo student account cannot be deleted' });
    }

    await db.query('DELETE FROM student_details WHERE student_id = ?', [id]);
    await db.query('DELETE FROM users WHERE id = ? AND role = "Student"', [id]);

    return res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete student', error: error.message });
  }
};
