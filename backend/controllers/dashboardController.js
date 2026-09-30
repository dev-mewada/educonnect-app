const db = require('../config/db');

/**
 * GET /api/dashboard/admin
 * Real metrics calculated from MySQL for the Admin Dashboard
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    // 1. Total Students
    const [stuRows] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'Student'");
    const totalStudents = stuRows[0]?.total || 0;

    // 2. Total Teachers
    const [teachRows] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role = 'Teacher'");
    const totalTeachers = teachRows[0]?.total || 0;

    // 3. Total Courses
    const [courseRows] = await db.query('SELECT COUNT(*) AS total FROM courses');
    const totalCourses = courseRows[0]?.total || 0;

    // 4. Live / Upcoming Classes
    const [liveRows] = await db.query("SELECT COUNT(*) AS total FROM live_classes WHERE status IN ('Live', 'Upcoming')");
    const activeLiveClasses = liveRows[0]?.total || 0;

    // 5. Total Enrollments
    const [enrRows] = await db.query('SELECT COUNT(*) AS total FROM enrollments');
    const totalEnrollments = enrRows[0]?.total || 0;

    // 6. Total Messages
    const [msgRows] = await db.query('SELECT COUNT(*) AS total FROM messages');
    const totalMessages = msgRows[0]?.total || 0;

    // 7. Monthly Enrollment Trends (last 6 months)
    const [trends] = await db.query(
      `SELECT DATE_FORMAT(enrolled_at, '%b %Y') AS month_label, COUNT(*) AS count
       FROM enrollments
       GROUP BY DATE_FORMAT(enrolled_at, '%b %Y')
       ORDER BY MIN(enrolled_at) ASC
       LIMIT 6`
    );

    // 8. Courses by Category
    const [categories] = await db.query(
      `SELECT category, COUNT(*) AS count
       FROM courses
       GROUP BY category`
    );

    // 9. Recent Registrations & Pending Approvals
    const [pendingRegistrations] = await db.query(
      `SELECT id, name, email, role, status, created_at
       FROM users
       WHERE status = 'Pending'
       ORDER BY created_at DESC
       LIMIT 5`
    );

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalCourses,
        activeLiveClasses,
        totalEnrollments,
        totalMessages,
        monthlyTrends: trends,
        categories,
        pendingRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics', error: error.message });
  }
};

/**
 * GET /api/dashboard/teacher
 * Real metrics for authenticated Teacher
 */
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. Own Courses
    const [courseRows] = await db.query('SELECT COUNT(*) AS total FROM courses WHERE teacher_id = ?', [teacherId]);
    const ownCoursesCount = courseRows[0]?.total || 0;

    // 2. Own Total Students (Unique enrolled students across teacher's courses)
    const [enrRows] = await db.query(
      `SELECT COUNT(DISTINCT e.student_id) AS total_students, COUNT(e.id) AS total_enrollments
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE c.teacher_id = ?`,
      [teacherId]
    );
    const totalStudents = enrRows[0]?.total_students || 0;
    const totalEnrollments = enrRows[0]?.total_enrollments || 0;

    // 3. Upcoming / Live Classes
    const [liveRows] = await db.query(
      "SELECT COUNT(*) AS total FROM live_classes WHERE teacher_id = ? AND status IN ('Live', 'Upcoming')",
      [teacherId]
    );
    const upcomingLiveClasses = liveRows[0]?.total || 0;

    // 4. Reviews & Rating
    const [revRows] = await db.query(
      `SELECT COUNT(r.id) AS count, COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS avg_rating
       FROM reviews r
       JOIN courses c ON r.course_id = c.id
       WHERE c.teacher_id = ?`,
      [teacherId]
    );
    const reviewsCount = revRows[0]?.count || 0;
    const avgRating = revRows[0]?.avg_rating || 5.0;

    // 5. Unread Messages
    const [unreadMsg] = await db.query(
      'SELECT COUNT(*) AS total FROM messages WHERE receiver_id = ? AND is_read = 0',
      [teacherId]
    );
    const unreadMessages = unreadMsg[0]?.total || 0;

    // 6. Recent Enrollments
    const [recentEnrollments] = await db.query(
      `SELECT e.id, e.enrolled_at, e.progress, u.name AS student_name, u.email AS student_email, c.title AS course_title
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON e.student_id = u.id
       WHERE c.teacher_id = ?
       ORDER BY e.enrolled_at DESC
       LIMIT 5`,
      [teacherId]
    );

    // 7. Recent Scheduled Classes
    const [recentClasses] = await db.query(
      `SELECT lc.*, c.title AS course_title
       FROM live_classes lc
       JOIN courses c ON lc.course_id = c.id
       WHERE lc.teacher_id = ?
       ORDER BY lc.created_at DESC
       LIMIT 5`,
      [teacherId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ownCoursesCount,
        totalStudents,
        totalEnrollments,
        upcomingLiveClasses,
        reviewsCount,
        avgRating,
        unreadMessages,
        recentEnrollments,
        recentClasses
      }
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch teacher dashboard', error: error.message });
  }
};

/**
 * GET /api/dashboard/student
 * Real metrics for authenticated Student
 */
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Enrolled Courses
    const [enrRows] = await db.query(
      `SELECT e.id, e.progress, e.status, e.enrolled_at,
              c.id AS course_id, c.title, c.image, c.category, c.duration,
              u.name AS instructor_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON c.teacher_id = u.id
       WHERE e.student_id = ?
       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );
    const enrolledCourses = enrRows;
    const enrolledCount = enrRows.length;

    // 2. Average Progress
    const avgProgress = enrolledCount > 0
      ? Math.round(enrRows.reduce((sum, r) => sum + (r.progress || 0), 0) / enrolledCount)
      : 0;

    // 3. Completed Courses
    const completedCount = enrRows.filter(r => r.progress === 100 || r.status === 'Completed').length;

    // 4. Available Live Classes for Enrolled Courses
    const [liveRows] = await db.query(
      `SELECT lc.*, c.title AS course_title, u.name AS teacher_name
       FROM live_classes lc
       JOIN enrollments e ON lc.course_id = e.course_id
       JOIN courses c ON lc.course_id = c.id
       JOIN users u ON lc.teacher_id = u.id
       WHERE e.student_id = ? AND lc.status IN ('Upcoming', 'Live')
       ORDER BY lc.created_at DESC`,
      [studentId]
    );
    const availableLiveClasses = liveRows;

    // 5. Total Live Classes Attended
    const [attRows] = await db.query(
      'SELECT COUNT(*) AS total FROM attendance WHERE student_id = ?',
      [studentId]
    );
    const attendedCount = attRows[0]?.total || 0;

    // 6. Unread Messages
    const [unreadMsg] = await db.query(
      'SELECT COUNT(*) AS total FROM messages WHERE receiver_id = ? AND is_read = 0',
      [studentId]
    );
    const unreadMessages = unreadMsg[0]?.total || 0;

    // 7. Unread Notifications
    const [unreadNotif] = await db.query(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0',
      [studentId]
    );
    const unreadNotifications = unreadNotif[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: {
        enrolledCount,
        avgProgress,
        completedCount,
        attendedCount,
        unreadMessages,
        unreadNotifications,
        enrolledCourses,
        availableLiveClasses
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch student dashboard', error: error.message });
  }
};
