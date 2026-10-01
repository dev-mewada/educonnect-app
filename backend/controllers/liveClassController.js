const db = require('../config/db');

/**
 * Generate a random 6-character uppercase session code, e.g. "EDU-7392"
 */
function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LIVE-${code}`;
}

/**
 * GET /api/live-classes
 * Role-aware retrieval of live classes
 */
exports.getLiveClasses = async (req, res) => {
  try {
    const user = req.user;
    const { status, courseId, teacherId } = req.query;

    let query = `
      SELECT lc.*, 
             MAX(c.title) AS course_title, 
             MAX(u.name) AS teacher_name,
             MAX(u.email) AS teacher_email,
             COUNT(DISTINCT a.id) AS real_attendees_count
      FROM live_classes lc
      JOIN courses c ON lc.course_id = c.id
      JOIN users u ON lc.teacher_id = u.id
      LEFT JOIN attendance a ON lc.id = a.live_class_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by teacher
    if (user?.role === 'Teacher') {
      query += ' AND lc.teacher_id = ?';
      params.push(user.id);
    } else if (teacherId) {
      query += ' AND lc.teacher_id = ?';
      params.push(teacherId);
    }

    // Filter by course
    if (courseId) {
      query += ' AND lc.course_id = ?';
      params.push(courseId);
    }

    // Filter by status
    if (status) {
      query += ' AND lc.status = ?';
      params.push(status);
    }

    query += ' GROUP BY lc.id ORDER BY lc.created_at DESC';

    const [rows] = await db.query(query, params);

    // If student, check if enrolled in the course and check their attendance status
    let result = rows;
    if (user?.role === 'Student') {
      const [studentAttendance] = await db.query(
        'SELECT live_class_id, joined_at, status FROM attendance WHERE student_id = ?',
        [user.id]
      );
      const attendedMap = new Map(studentAttendance.map(a => [a.live_class_id, a]));

      const [enrolledCourses] = await db.query(
        'SELECT course_id FROM enrollments WHERE student_id = ?',
        [user.id]
      );
      const enrolledSet = new Set(enrolledCourses.map(e => e.course_id));

      result = rows.map(lc => ({
        ...lc,
        is_enrolled: enrolledSet.has(lc.course_id),
        has_attended: attendedMap.has(lc.id),
        attendance_info: attendedMap.get(lc.id) || null
      }));
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch live classes', error: error.message });
  }
};

/**
 * GET /api/live-classes/:id
 * Fetch single live class details
 */
exports.getLiveClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [rows] = await db.query(
      `SELECT lc.*, 
              MAX(c.title) AS course_title, 
              MAX(u.name) AS teacher_name, 
              MAX(u.email) AS teacher_email,
              COUNT(DISTINCT a.id) AS real_attendees_count
       FROM live_classes lc
       JOIN courses c ON lc.course_id = c.id
       JOIN users u ON lc.teacher_id = u.id
       LEFT JOIN attendance a ON lc.id = a.live_class_id
       WHERE lc.id = ?
       GROUP BY lc.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const liveClass = rows[0];

    // Check student attendance
    let hasAttended = false;
    let attendanceRecord = null;
    let isEnrolled = false;

    if (user?.role === 'Student') {
      const [att] = await db.query(
        'SELECT * FROM attendance WHERE live_class_id = ? AND student_id = ?',
        [id, user.id]
      );
      if (att.length > 0) {
        hasAttended = true;
        attendanceRecord = att[0];
      }

      const [enr] = await db.query(
        'SELECT id FROM enrollments WHERE course_id = ? AND student_id = ?',
        [liveClass.course_id, user.id]
      );
      isEnrolled = enr.length > 0;
    }

    // Hide session_code from student if not live or if teacher has not shared it
    // But when Live, student sees the session is active and needs the code from teacher
    const responseData = {
      ...liveClass,
      has_attended: hasAttended,
      attendance: attendanceRecord,
      is_enrolled: isEnrolled
    };

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching live class by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch live class', error: error.message });
  }
};

/**
 * POST /api/live-classes
 * Schedule a new live class (Teacher or Admin)
 */
exports.createLiveClass = async (req, res) => {
  try {
    const courseId = req.body.courseId || req.body.course_id;
    const title = req.body.title;
    const description = req.body.description || '';
    const scheduledAt = req.body.scheduledAt || req.body.scheduled_at || (req.body.scheduled_date && req.body.start_time ? `${req.body.scheduled_date} ${req.body.start_time}` : null);
    const meetingLink = req.body.meetingLink || req.body.meeting_link;
    let teacherId = req.user.id;

    if (!title || !courseId || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'Title, courseId, and scheduledAt are required' });
    }

    // Verify course exists
    const [courseRows] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (courseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // If teacher, ensure they own the course
    if (req.user.role === 'Teacher' && courseRows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only schedule live classes for your own courses' });
    }

    if (req.user.role === 'Admin' && courseRows[0].teacher_id) {
      teacherId = courseRows[0].teacher_id;
    }

    // Provide default meeting room if not specified
    const roomLink = meetingLink?.trim() || `https://meet.jit.si/educonnect-live-${Date.now()}`;

    const [result] = await db.query(
      `INSERT INTO live_classes (title, description, course_id, teacher_id, scheduled_at, meeting_link, status, attendees_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Upcoming', 0, NOW())`,
      [title.trim(), description || '', courseId, teacherId, scheduledAt, roomLink]
    );

    const liveClassId = result.insertId;

    // Send notifications to all enrolled students for this course
    const [enrolledStudents] = await db.query(
      'SELECT student_id FROM enrollments WHERE course_id = ?',
      [courseId]
    );

    for (const enr of enrolledStudents) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, 'live_class_scheduled', 0, NOW())`,
        [
          enr.student_id,
          'New Live Class Scheduled',
          `"${title}" for your course "${courseRows[0].title}" has been scheduled for ${scheduledAt}.`
        ]
      );
    }

    const [newClass] = await db.query(
      `SELECT lc.*, c.title AS course_title, u.name AS teacher_name
       FROM live_classes lc
       JOIN courses c ON lc.course_id = c.id
       JOIN users u ON lc.teacher_id = u.id
       WHERE lc.id = ?`,
      [liveClassId]
    );

    return res.status(201).json({
      success: true,
      message: 'Live class scheduled successfully',
      data: newClass[0]
    });
  } catch (error) {
    console.error('Error creating live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to schedule live class', error: error.message });
  }
};

/**
 * PUT /api/live-classes/:id
 * Edit live class (Teacher owner or Admin)
 */
exports.updateLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, scheduledAt, meetingLink, status } = req.body;

    const [existing] = await db.query('SELECT * FROM live_classes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (req.user.role === 'Teacher' && existing[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own live classes' });
    }

    const updatedTitle = title !== undefined ? title : existing[0].title;
    const updatedDesc = description !== undefined ? description : existing[0].description;
    const updatedSched = scheduledAt !== undefined ? scheduledAt : existing[0].scheduled_at;
    const updatedLink = meetingLink !== undefined ? meetingLink : existing[0].meeting_link;
    const updatedStatus = status !== undefined ? status : existing[0].status;

    await db.query(
      `UPDATE live_classes 
       SET title = ?, description = ?, scheduled_at = ?, meeting_link = ?, status = ?
       WHERE id = ?`,
      [updatedTitle, updatedDesc, updatedSched, updatedLink, updatedStatus, id]
    );

    const [updated] = await db.query('SELECT * FROM live_classes WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Live class updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to update live class', error: error.message });
  }
};

/**
 * DELETE /api/live-classes/:id
 * Cancel / Delete live class (Teacher owner or Admin)
 */
exports.deleteLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM live_classes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (req.user.role === 'Teacher' && existing[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own live classes' });
    }

    await db.query('DELETE FROM live_classes WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Live class cancelled and deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete live class', error: error.message });
  }
};

/**
 * POST /api/live-classes/:id/start
 * Teacher starts the live class: generates active session check-in code, sets status='Live'
 */
exports.startLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM live_classes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const liveClass = existing[0];
    if (req.user.role === 'Teacher' && liveClass.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only start your own live classes' });
    }

    if (liveClass.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Class has already been completed' });
    }

    // Generate unique session code
    const sessionCode = generateSessionCode();

    await db.query(
      `UPDATE live_classes 
       SET status = 'Live', session_code = ?, actual_start_time = NOW()
       WHERE id = ?`,
      [sessionCode, id]
    );

    // Notify enrolled students that class is NOW LIVE
    const [enrolledStudents] = await db.query(
      'SELECT student_id FROM enrollments WHERE course_id = ?',
      [liveClass.course_id]
    );

    for (const enr of enrolledStudents) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, 'live_class_started', 0, NOW())`,
        [
          enr.student_id,
          'Live Class is LIVE Now!',
          `"${liveClass.title}" is now active. Join the class and check in!`
        ]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Live class started successfully',
      status: 'Live',
      sessionCode,
      data: {
        id,
        status: 'Live',
        session_code: sessionCode,
        sessionCode
      },
      actualStartTime: new Date()
    });
  } catch (error) {
    console.error('Error starting live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to start live class', error: error.message });
  }
};

/**
 * POST /api/live-classes/:id/end
 * Teacher ends the live class: sets status='Completed', sets actual_end_time, saves final attendance count
 */
exports.endLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM live_classes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const liveClass = existing[0];
    if (req.user.role === 'Teacher' && liveClass.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only end your own live classes' });
    }

    // Calculate actual attendees
    const [attCount] = await db.query(
      'SELECT COUNT(DISTINCT student_id) AS total FROM attendance WHERE live_class_id = ?',
      [id]
    );
    const finalCount = attCount[0]?.total || 0;

    await db.query(
      `UPDATE live_classes 
       SET status = 'Completed', actual_end_time = NOW(), attendees_count = ?
       WHERE id = ?`,
      [finalCount, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Live class ended successfully',
      status: 'Completed',
      data: {
        id,
        status: 'Completed',
        attendees_count: finalCount
      },
      attendeesCount: finalCount
    });
  } catch (error) {
    console.error('Error ending live class:', error);
    return res.status(500).json({ success: false, message: 'Failed to end live class', error: error.message });
  }
};

/**
 * POST /api/live-classes/:id/check-in
 * Student checks in to the active live class using the session code.
 * Non-biometric attendance validation.
 */
exports.checkInLiveClass = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const sessionCode = req.body.sessionCode || req.body.session_code;

    if (!sessionCode || sessionCode.trim() === '') {
      return res.status(400).json({ success: false, message: 'Attendance session code is required' });
    }

    // 1. Fetch live class
    const [classRows] = await db.query('SELECT * FROM live_classes WHERE id = ?', [id]);
    if (classRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const liveClass = classRows[0];

    // 2. Validate live class state
    if (liveClass.status === 'Upcoming') {
      return res.status(400).json({
        success: false,
        message: 'This class has not been started yet. Attendance is only available once the teacher starts the live class.'
      });
    }

    if (liveClass.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This live session has already ended. Attendance check-in is closed.'
      });
    }

    // 3. Verify student is enrolled in the course
    const [enrRows] = await db.query(
      'SELECT id FROM enrollments WHERE course_id = ? AND student_id = ?',
      [liveClass.course_id, studentId]
    );

    if (enrRows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to attend and record attendance.'
      });
    }

    // 4. Validate session code (case-insensitive trim comparison)
    const validCode = (liveClass.session_code || '').trim().toUpperCase();
    const enteredCode = sessionCode.trim().toUpperCase();

    if (!validCode || validCode !== enteredCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session check-in code. Please verify the code displayed by your instructor.'
      });
    }

    // 5. Check duplicate check-in
    const [existingAtt] = await db.query(
      'SELECT id, joined_at, status FROM attendance WHERE live_class_id = ? AND student_id = ?',
      [id, studentId]
    );

    if (existingAtt.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already checked in for this live class.',
        attendance: existingAtt[0]
      });
    }

    // 6. Record attendance in MySQL
    const [insertResult] = await db.query(
      `INSERT INTO attendance (live_class_id, student_id, joined_at, status, session_code_used, created_at)
       VALUES (?, ?, NOW(), 'Present', ?, NOW())`,
      [id, studentId, enteredCode]
    );

    // 7. Update attendees count on live_classes
    await db.query(
      'UPDATE live_classes SET attendees_count = attendees_count + 1 WHERE id = ?',
      [id]
    );

    // 8. Notification to student
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, 'attendance_confirmed', 0, NOW())`,
      [
        studentId,
        'Attendance Recorded',
        `Your attendance for "${liveClass.title}" has been successfully recorded as Present.`
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully! You are marked Present.',
      attendanceId: insertResult.insertId,
      status: 'Present',
      attendance: {
        id: insertResult.insertId,
        live_class_id: id,
        student_id: studentId,
        status: 'Present',
        session_code_used: enteredCode,
        joined_at: new Date()
      },
      joinedAt: new Date()
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    return res.status(500).json({ success: false, message: 'Failed to record attendance', error: error.message });
  }
};

/**
 * GET /api/live-classes/:id/attendance
 * Teacher or Admin views attendees list for a live class
 */
exports.getClassAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const [classRows] = await db.query('SELECT * FROM live_classes WHERE id = ?', [id]);
    if (classRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (req.user.role === 'Teacher' && classRows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only view attendance for your own classes' });
    }

    const [attendees] = await db.query(
      `SELECT a.id, a.joined_at, a.left_at, a.status, a.session_code_used, a.created_at,
              u.id AS student_id, u.name AS student_name, u.email AS student_email, u.profile_photo AS student_photo
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       WHERE a.live_class_id = ?
       ORDER BY a.joined_at ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      count: attendees.length,
      data: attendees
    });
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
};

/**
 * GET /api/live-classes/my-attendance
 * Student views their personal attendance history
 */
exports.getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await db.query(
      `SELECT a.id, a.joined_at, a.status, a.created_at,
              lc.id AS live_class_id, lc.title AS class_title, lc.scheduled_at, lc.meeting_link,
              c.title AS course_title,
              u.name AS teacher_name
       FROM attendance a
       JOIN live_classes lc ON a.live_class_id = lc.id
       JOIN courses c ON lc.course_id = c.id
       JOIN users u ON lc.teacher_id = u.id
       WHERE a.student_id = ?
       ORDER BY a.joined_at DESC`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching personal attendance:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance history', error: error.message });
  }
};
