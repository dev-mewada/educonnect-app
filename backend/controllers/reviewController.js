const db = require('../config/db');

/**
 * GET /api/reviews
 * Fetch reviews. Can filter by courseId or fetch all platform reviews.
 */
exports.getReviews = async (req, res) => {
  try {
    const { courseId } = req.query;

    let query = `
      SELECT r.id, r.rating, r.review AS comment, r.created_at,
             u.id AS student_id, u.name AS student_name, u.profile_photo AS student_photo,
             c.id AS course_id, c.title AS course_title
      FROM reviews r
      JOIN users u ON r.student_id = u.id
      JOIN courses c ON r.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += ' AND r.course_id = ?';
      params.push(courseId);
    }

    query += ' ORDER BY r.created_at DESC';

    const [rows] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
};

/**
 * POST /api/reviews
 * Student posts a review for a course they are enrolled in
 */
exports.addReview = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, rating, comment } = req.body;

    if (!courseId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Course ID, rating, and comment are required' });
    }

    const numRating = Math.min(5, Math.max(1, parseInt(rating, 10)));

    // Verify course exists
    const [courseRows] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (courseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify student is enrolled in the course
    const [enrRows] = await db.query(
      'SELECT id FROM enrollments WHERE course_id = ? AND student_id = ?',
      [courseId, studentId]
    );

    if (enrRows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only review courses you are enrolled in'
      });
    }

    // Check duplicate review
    const [existing] = await db.query(
      'SELECT id FROM reviews WHERE course_id = ? AND student_id = ?',
      [courseId, studentId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this course'
      });
    }

    const [result] = await db.query(
      'INSERT INTO reviews (student_id, course_id, rating, review, created_at) VALUES (?, ?, ?, ?, NOW())',
      [studentId, courseId, numRating, comment.trim()]
    );

    const [saved] = await db.query(
      `SELECT r.id, r.rating, r.review AS comment, r.created_at,
              u.name AS student_name, c.title AS course_title
       FROM reviews r
       JOIN users u ON r.student_id = u.id
       JOIN courses c ON r.course_id = c.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: saved[0]
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review', error: error.message });
  }
};
