const db = require('../config/db');

/**
 * GET /api/courses
 * Fetch courses from MySQL with instructor details, enrollment counts, and average ratings.
 * Supports query params: category, search, teacherId, status, myCourses
 */
exports.getCourses = async (req, res) => {
  try {
    const { category, search, teacherId, status, myCourses } = req.query;
    const user = req.user; // Set by protect or optional auth if available

    let query = `
      SELECT c.*, 
             u.name AS instructor_name, 
             u.email AS instructor_email,
             COUNT(DISTINCT e.id) AS total_students,
             COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS avg_rating,
             COUNT(DISTINCT r.id) AS reviews_count
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by teacher
    if (myCourses === 'true' && user?.id) {
      query += ' AND c.teacher_id = ?';
      params.push(user.id);
    } else if (teacherId) {
      query += ' AND c.teacher_id = ?';
      params.push(teacherId);
    }

    // Role-based visibility
    if (!user || user.role === 'Student') {
      query += " AND c.status = 'Published'";
    } else if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    // Category filter
    if (category && category !== 'All' && category !== 'All Categories') {
      query += ' AND c.category = ?';
      params.push(category);
    }

    // Search query
    if (search && search.trim() !== '') {
      query += ' AND (c.title LIKE ? OR c.description LIKE ? OR u.name LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const [rows] = await db.query(query, params);

    // If user is authenticated student, check enrollment status for each course
    let coursesWithEnrollment = rows;
    if (user && user.role === 'Student') {
      const [enrollmentRows] = await db.query(
        'SELECT course_id, progress FROM enrollments WHERE student_id = ?',
        [user.id]
      );
      const enrolledMap = new Map(enrollmentRows.map(e => [e.course_id, e.progress]));
      coursesWithEnrollment = rows.map(c => ({
        ...c,
        is_enrolled: enrolledMap.has(c.id),
        user_progress: enrolledMap.get(c.id) ?? null
      }));
    }

    return res.status(200).json({
      success: true,
      count: coursesWithEnrollment.length,
      data: coursesWithEnrollment
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
};

/**
 * GET /api/courses/:id
 * Fetch single course details by ID
 */
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [rows] = await db.query(
      `SELECT c.*, 
              u.name AS instructor_name, 
              u.email AS instructor_email,
              u.profile_photo AS instructor_photo,
              COUNT(DISTINCT e.id) AS total_students,
              COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS avg_rating,
              COUNT(DISTINCT r.id) AS reviews_count
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const course = rows[0];

    // Check if enrolled
    let isEnrolled = false;
    let enrollmentDetails = null;
    if (user) {
      const [enr] = await db.query(
        'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
        [user.id, id]
      );
      if (enr.length > 0) {
        isEnrolled = true;
        enrollmentDetails = enr[0];
      }
    }

    // Fetch reviews for course
    const [reviews] = await db.query(
      `SELECT r.*, u.name AS student_name, u.profile_photo AS student_photo
       FROM reviews r
       JOIN users u ON r.student_id = u.id
       WHERE r.course_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...course,
        is_enrolled: isEnrolled,
        enrollment: enrollmentDetails,
        reviews
      }
    });
  } catch (error) {
    console.error('Error fetching course by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
  }
};

/**
 * POST /api/courses
 * Create new course. Teacher or Admin only.
 */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price, duration, image, status = 'Published', syllabus } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required' });
    }

    // Teacher ID comes securely from authenticated JWT
    let teacherId = req.user.id;
    if (req.user.role === 'Admin' && req.body.teacher_id) {
      teacherId = req.body.teacher_id;
    }

    // Default placeholder thumbnail if none provided
    const courseImage = image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';

    const [result] = await db.query(
      `INSERT INTO courses 
        (teacher_id, title, description, category, image, price, duration, syllabus, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        teacherId,
        title.trim(),
        description || '',
        category.trim(),
        courseImage,
        parseFloat(price) || 0,
        duration || '30 Hours',
        typeof syllabus === 'string' ? syllabus : JSON.stringify(syllabus || []),
        status
      ]
    );

    const [newCourse] = await db.query(
      `SELECT c.*, u.name AS instructor_name 
       FROM courses c 
       LEFT JOIN users u ON c.teacher_id = u.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse[0]
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ success: false, message: 'Failed to create course', error: error.message });
  }
};

/**
 * PUT /api/courses/:id
 * Update course. Teacher (owner) or Admin only.
 */
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price, duration, image, status, syllabus } = req.body;

    // Check course existence
    const [existing] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const course = existing[0];

    // Ownership check: Teacher can only update own course
    if (req.user.role === 'Teacher' && course.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit courses you own' });
    }

    const updatedTitle = title !== undefined ? title : course.title;
    const updatedDesc = description !== undefined ? description : course.description;
    const updatedCat = category !== undefined ? category : course.category;
    const updatedPrice = price !== undefined ? parseFloat(price) : course.price;
    const updatedDuration = duration !== undefined ? duration : course.duration;
    const updatedImage = image !== undefined ? image : course.image;
    const updatedStatus = status !== undefined ? status : course.status;
    const updatedSyllabus = syllabus !== undefined 
      ? (typeof syllabus === 'string' ? syllabus : JSON.stringify(syllabus))
      : course.syllabus;

    await db.query(
      `UPDATE courses 
       SET title = ?, description = ?, category = ?, price = ?, duration = ?, image = ?, status = ?, syllabus = ?, updated_at = NOW()
       WHERE id = ?`,
      [updatedTitle, updatedDesc, updatedCat, updatedPrice, updatedDuration, updatedImage, updatedStatus, updatedSyllabus, id]
    );

    const [updated] = await db.query(
      `SELECT c.*, u.name AS instructor_name, COUNT(DISTINCT e.id) AS total_students
       FROM courses c 
       LEFT JOIN users u ON c.teacher_id = u.id 
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).json({ success: false, message: 'Failed to update course', error: error.message });
  }
};

/**
 * PATCH /api/courses/:id/publish
 * Toggle publish status of course. Teacher (owner) or Admin.
 */
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const course = existing[0];
    if (req.user.role === 'Teacher' && course.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only publish/unpublish your own courses' });
    }

    const newStatus = req.body.status || (course.status === 'Published' ? 'Draft' : 'Published');
    await db.query('UPDATE courses SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, id]);

    return res.status(200).json({
      success: true,
      message: `Course ${newStatus === 'Published' ? 'published' : 'unpublished'} successfully`,
      status: newStatus,
      data: { id: parseInt(id), status: newStatus }
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

/**
 * DELETE /api/courses/:id
 * Delete course. Teacher (owner) or Admin only.
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const course = existing[0];
    if (req.user.role === 'Teacher' && course.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete courses you own' });
    }

    // Cascade delete related records in attendance, live_classes, enrollments, reviews
    // Foreign keys with ON DELETE CASCADE will handle child records, or explicitly cleanup
    await db.query('DELETE FROM courses WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  }
};

/**
 * GET /api/courses/:id/enrollments
 * View enrolled students for a specific course.
 */
exports.getCourseEnrollments = async (req, res) => {
  try {
    const { id } = req.params;

    const [courseRows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (courseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role === 'Teacher' && courseRows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Not your course' });
    }

    const [enrollments] = await db.query(
      `SELECT e.id, e.progress, e.status, e.enrolled_at,
              u.id AS student_id, u.name AS student_name, u.email AS student_email, u.mobile AS student_mobile
       FROM enrollments e
       JOIN users u ON e.student_id = u.id
       WHERE e.course_id = ?
       ORDER BY e.enrolled_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch enrollments', error: error.message });
  }
};
