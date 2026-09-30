const db = require('../config/db');

/**
 * POST /api/enrollments
 * Student enrolls in a published course.
 */
exports.enrollInCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courseId = req.body.courseId || req.body.course_id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    // 1. Verify course exists and is published
    const [courseRows] = await db.query(
      'SELECT id, title, teacher_id, status FROM courses WHERE id = ?',
      [courseId]
    );

    if (courseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const course = courseRows[0];
    if (course.status !== 'Published') {
      return res.status(400).json({ success: false, message: 'Cannot enroll in an unpublished course' });
    }

    // 2. Prevent duplicate enrollment
    const [existing] = await db.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You are already enrolled in this course' });
    }

    // 3. Save enrollment to MySQL
    const [result] = await db.query(
      `INSERT INTO enrollments (student_id, course_id, progress, status, enrolled_at)
       VALUES (?, ?, 0, 'Active', NOW())`,
      [studentId, courseId]
    );

    // 4. Send real notification to student
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, 'enrollment', 0, NOW())`,
      [
        studentId,
        'Enrollment Confirmed',
        `You have successfully enrolled in "${course.title}". Start learning today!`
      ]
    );

    // 5. Send real notification to course teacher
    const [studentRows] = await db.query('SELECT name FROM users WHERE id = ?', [studentId]);
    const studentName = studentRows[0]?.name || 'A student';

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, 'course_enrollment', 0, NOW())`,
      [
        course.teacher_id,
        'New Student Enrolled',
        `${studentName} has enrolled in your course "${course.title}".`
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollmentId: result.insertId
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to enroll in course', error: error.message });
  }
};

/**
 * GET /api/enrollments/my
 * Fetch all enrolled courses for the authenticated student.
 */
exports.getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await db.query(
      `SELECT e.id AS enrollment_id, e.progress, e.status AS enrollment_status, e.enrolled_at,
              c.id AS course_id, c.title, c.description, c.category, c.image, c.price, c.duration, c.syllabus,
              u.name AS instructor_name, u.email AS instructor_email
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON c.teacher_id = u.id
       WHERE e.student_id = ?
       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch enrollments', error: error.message });
  }
};

/**
 * PATCH /api/enrollments/:id/progress
 * Update progress for student's enrollment
 */
exports.updateProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { progress } = req.body;

    const newProgress = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));
    const newStatus = newProgress >= 100 ? 'Completed' : 'Active';

    // Verify ownership
    const [enrRows] = await db.query(
      'SELECT * FROM enrollments WHERE id = ? AND student_id = ?',
      [id, studentId]
    );

    if (enrRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    await db.query(
      'UPDATE enrollments SET progress = ?, status = ? WHERE id = ?',
      [newProgress, newStatus, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      progress: newProgress,
      status: newStatus
    });
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    return res.status(500).json({ success: false, message: 'Failed to update progress', error: error.message });
  }
};

/**
 * GET /api/enrollments/check/:courseId
 * Check if current student is enrolled in course
 */
exports.checkEnrollment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    const [rows] = await db.query(
      'SELECT id, progress, status, enrolled_at FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    return res.status(200).json({
      success: true,
      isEnrolled: rows.length > 0,
      enrollment: rows[0] || null
    });
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return res.status(500).json({ success: false, message: 'Failed to check enrollment', error: error.message });
  }
};
