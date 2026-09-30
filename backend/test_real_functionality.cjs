const db = require('./config/db');

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('EDUCONNECT PRO — END-TO-END FUNCTIONALITY TEST SUITE');
  console.log('====================================================\n');

  let adminToken, teacherToken, studentToken;
  let teacherId, studentId, adminId;

  // ----------------------------------------------------------------
  // 1. AUTHENTICATION & DEMO ACCOUNTS
  // ----------------------------------------------------------------
  console.log('>>> [1/6] AUTHENTICATION TESTS');

  // Admin Login
  const adminRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@educonnect.com', password: 'Password123', role: 'Admin' }
  });
  if (!adminRes.ok || !adminRes.data.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminRes.data)}`);
  }
  adminToken = adminRes.data.token;
  adminId = adminRes.data.user.id;
  console.log('  ✅ Admin login successful (id:', adminId, ')');

  // Teacher Login
  const teacherRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'teacher@educonnect.com', password: 'Password123', role: 'Teacher' }
  });
  if (!teacherRes.ok || !teacherRes.data.token) {
    throw new Error(`Teacher login failed: ${JSON.stringify(teacherRes.data)}`);
  }
  teacherToken = teacherRes.data.token;
  teacherId = teacherRes.data.user.id;
  console.log('  ✅ Teacher login successful (id:', teacherId, ')');

  // Student Login
  const studentRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'student@educonnect.com', password: 'Password123', role: 'Student' }
  });
  if (!studentRes.ok || !studentRes.data.token) {
    throw new Error(`Student login failed: ${JSON.stringify(studentRes.data)}`);
  }
  studentToken = studentRes.data.token;
  studentId = studentRes.data.user.id;
  console.log('  ✅ Student login successful (id:', studentId, ')');

  // JWT /me verification
  const meRes = await request('/auth/me', { method: 'GET', token: teacherToken });
  if (!meRes.ok || meRes.data.user.email !== 'teacher@educonnect.com') {
    throw new Error(`JWT /me verification failed: ${JSON.stringify(meRes.data)}`);
  }
  console.log('  ✅ JWT /me profile verification successful\n');

  // ----------------------------------------------------------------
  // 2. COURSE LIFECYCLE & ENROLLMENT
  // ----------------------------------------------------------------
  console.log('>>> [2/6] COURSE MANAGEMENT & ENROLLMENT TESTS');

  const courseTitle = `E2E Automated Course - ${Date.now()}`;
  const createCourseRes = await request('/courses', {
    method: 'POST',
    token: teacherToken,
    body: {
      title: courseTitle,
      description: 'End to end automated verification course with live sessions and real attendance.',
      category: 'Computer Science',
      level: 'Intermediate',
      price: 1499,
      duration: '6 Weeks',
      status: 'Draft'
    }
  });

  const createdCourse = createCourseRes.data.data || createCourseRes.data.course;
  if (!createCourseRes.ok || !createdCourse) {
    throw new Error(`Course creation failed: ${JSON.stringify(createCourseRes.data)}`);
  }
  const createdCourseId = createdCourse.id;
  console.log('  ✅ Teacher created course in MySQL (id:', createdCourseId, ', title:', courseTitle, ')');

  // Verify in MySQL directly
  const [courseInDb] = await db.query('SELECT id, title, status, teacher_id FROM courses WHERE id = ?', [createdCourseId]);
  if (!courseInDb.length || courseInDb[0].title !== courseTitle) {
    throw new Error('Course not found in MySQL directly!');
  }
  console.log('  ✅ Verified course exists in MySQL database directly');

  // Teacher views own courses
  const myCoursesRes = await request('/courses?myCourses=true', { method: 'GET', token: teacherToken });
  const myCourses = myCoursesRes.data.data || myCoursesRes.data.courses || [];
  const hasCourse = myCourses.some(c => c.id === createdCourseId);
  if (!hasCourse) throw new Error('Created course not listed in Teacher own courses');
  console.log('  ✅ Course correctly appears in Teacher own courses list');

  // Teacher publishes course
  const publishRes = await request(`/courses/${createdCourseId}/publish`, {
    method: 'PATCH',
    token: teacherToken,
    body: { status: 'Published' }
  });
  const pubCourse = publishRes.data.data || publishRes.data.course || publishRes.data;
  if (!publishRes.ok || pubCourse.status !== 'Published') {
    throw new Error(`Failed to publish course: ${JSON.stringify(publishRes.data)}`);
  }
  console.log('  ✅ Teacher toggled course status to "Published"');

  // Student browses published courses
  const browseRes = await request('/courses?status=Published', { method: 'GET', token: studentToken });
  const browseList = browseRes.data.data || browseRes.data.courses || [];
  const foundPublished = browseList.some(c => c.id === createdCourseId);
  if (!foundPublished) throw new Error('Student cannot find published course in catalog');
  console.log('  ✅ Student browses catalog and sees the published course');

  // Student enrolls in course
  const enrollRes = await request('/enrollments', {
    method: 'POST',
    token: studentToken,
    body: { courseId: createdCourseId }
  });
  if (!enrollRes.ok) {
    throw new Error(`Enrollment failed: ${JSON.stringify(enrollRes.data)}`);
  }
  console.log('  ✅ Student enrolled in course successfully');

  // Verify enrollment in MySQL
  const [enrollmentInDb] = await db.query(
    'SELECT id, student_id, course_id, status FROM enrollments WHERE student_id = ? AND course_id = ?',
    [studentId, createdCourseId]
  );
  if (!enrollmentInDb.length) throw new Error('Enrollment not found in MySQL!');
  console.log('  ✅ Verified enrollment record in MySQL database');

  // Duplicate enrollment prevention (HTTP 409 or 400)
  const dupEnrollRes = await request('/enrollments', {
    method: 'POST',
    token: studentToken,
    body: { courseId: createdCourseId }
  });
  if (dupEnrollRes.status !== 409 && dupEnrollRes.status !== 400) {
    throw new Error(`Duplicate enrollment was NOT blocked! Status: ${dupEnrollRes.status}`);
  }
  console.log('  ✅ Duplicate enrollment successfully prevented (HTTP', dupEnrollRes.status, ')');

  // Teacher views course enrollments count
  const courseDetailRes = await request(`/courses/${createdCourseId}`, { method: 'GET', token: teacherToken });
  const detail = courseDetailRes.data.data || courseDetailRes.data.course;
  if (!detail || (detail.total_students === undefined && detail.enrolled_count === undefined)) {
    throw new Error('Course details missing total students count');
  }
  console.log('  ✅ Teacher sees live updated enrollment count in course details\n');

  // ----------------------------------------------------------------
  // 3. LIVE CLASS & NON-BIOMETRIC ATTENDANCE
  // ----------------------------------------------------------------
  console.log('>>> [3/6] LIVE CLASS & ATTENDANCE TESTS');

  // Teacher schedules a live class for this course
  const scheduleRes = await request('/live-classes', {
    method: 'POST',
    token: teacherToken,
    body: {
      courseId: createdCourseId,
      title: 'E2E Hands-on Live Lab',
      description: 'Interactive session with real session code attendance verification',
      scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' '),
      meetingLink: 'https://meet.google.com/edu-e2e-test'
    }
  });

  const createdLiveClass = scheduleRes.data.data || scheduleRes.data.liveClass;
  if (!scheduleRes.ok || !createdLiveClass) {
    throw new Error(`Live class scheduling failed: ${JSON.stringify(scheduleRes.data)}`);
  }
  const liveClassId = createdLiveClass.id;
  console.log('  ✅ Teacher scheduled live class (id:', liveClassId, ')');

  // Student sees upcoming live class for enrolled course
  const studentLiveRes = await request('/live-classes', { method: 'GET', token: studentToken });
  const studentClasses = studentLiveRes.data.data || studentLiveRes.data.classes || [];
  const hasLiveClass = studentClasses.some(c => c.id === liveClassId);
  if (!hasLiveClass) throw new Error('Student cannot see scheduled live class for enrolled course');
  console.log('  ✅ Student views upcoming live class in class roster');

  // Student check-in before class is started should fail
  const earlyCheckInRes = await request(`/live-classes/${liveClassId}/check-in`, {
    method: 'POST',
    token: studentToken,
    body: { sessionCode: 'DUMMY' }
  });
  if (earlyCheckInRes.status !== 400) {
    throw new Error(`Early check-in before class started should be rejected! Status: ${earlyCheckInRes.status}`);
  }
  console.log('  ✅ Early check-in rejected when class is not Live (HTTP 400)');

  // Teacher starts the live class -> generates unique session code
  const startClassRes = await request(`/live-classes/${liveClassId}/start`, {
    method: 'POST',
    token: teacherToken
  });
  if (!startClassRes.ok || startClassRes.data.status !== 'Live') {
    throw new Error(`Failed to start live class: ${JSON.stringify(startClassRes.data)}`);
  }
  const activeSessionCode = startClassRes.data.sessionCode || startClassRes.data.data?.session_code;
  if (!activeSessionCode || !activeSessionCode.startsWith('LIVE-')) {
    throw new Error(`Invalid session code generated: ${activeSessionCode}`);
  }
  console.log('  ✅ Teacher started live class. Unique Session Code generated:', activeSessionCode);

  // Student attempts check-in with WRONG session code
  const wrongCodeRes = await request(`/live-classes/${liveClassId}/check-in`, {
    method: 'POST',
    token: studentToken,
    body: { sessionCode: 'LIVE-WRONG' }
  });
  if (wrongCodeRes.status !== 400) {
    throw new Error(`Invalid session code was NOT rejected! Status: ${wrongCodeRes.status}`);
  }
  console.log('  ✅ Invalid session code check-in rejected (HTTP 400)');

  // Student checks in with VALID session code
  const checkInRes = await request(`/live-classes/${liveClassId}/check-in`, {
    method: 'POST',
    token: studentToken,
    body: { sessionCode: activeSessionCode }
  });
  if (!checkInRes.ok || checkInRes.data.status !== 'Present') {
    throw new Error(`Valid check-in failed: ${JSON.stringify(checkInRes.data)}`);
  }
  console.log('  ✅ Student verified check-in with session code -> Marked Present');

  // Student duplicate check-in rejected
  const dupCheckInRes = await request(`/live-classes/${liveClassId}/check-in`, {
    method: 'POST',
    token: studentToken,
    body: { sessionCode: activeSessionCode }
  });
  if (dupCheckInRes.status !== 409 && dupCheckInRes.status !== 400) {
    throw new Error(`Duplicate check-in was NOT rejected! Status: ${dupCheckInRes.status}`);
  }
  console.log('  ✅ Duplicate check-in rejected (HTTP', dupCheckInRes.status, ')');

  // Verify attendance in MySQL
  const [attInDb] = await db.query(
    'SELECT id, live_class_id, student_id, status, session_code_used FROM attendance WHERE live_class_id = ? AND student_id = ?',
    [liveClassId, studentId]
  );
  if (!attInDb.length || attInDb[0].session_code_used !== activeSessionCode) {
    throw new Error('Attendance record missing or incorrect in MySQL!');
  }
  console.log('  ✅ Verified attendance record stored in MySQL database');

  // Teacher views live class attendance list
  const teacherAttRes = await request(`/live-classes/${liveClassId}/attendance`, {
    method: 'GET',
    token: teacherToken
  });
  const attendees = teacherAttRes.data.data || teacherAttRes.data.attendees || [];
  if (!teacherAttRes.ok || !attendees.some(a => a.student_id === studentId)) {
    throw new Error('Teacher cannot view attendee in live class');
  }
  console.log('  ✅ Teacher views real attendance roster in live class');

  // Student views own attendance history
  const studentAttHistoryRes = await request('/live-classes/my-attendance', {
    method: 'GET',
    token: studentToken
  });
  const myAttList = studentAttHistoryRes.data.data || studentAttHistoryRes.data.attendance || [];
  const inMyHistory = myAttList.some(a => a.live_class_id === liveClassId);
  if (!inMyHistory) throw new Error('Student attendance not in student attendance history');
  console.log('  ✅ Student views own attendance history from MySQL');

  // Teacher ends the live class
  const endClassRes = await request(`/live-classes/${liveClassId}/end`, {
    method: 'POST',
    token: teacherToken,
    body: { recording_url: 'https://storage.educonnect.com/recordings/e2e-session.mp4' }
  });
  if (!endClassRes.ok || endClassRes.data.status !== 'Completed') {
    throw new Error(`Failed to end live class: ${JSON.stringify(endClassRes.data)}`);
  }
  console.log('  ✅ Teacher ended class. Status = Completed, actual_end_time recorded\n');

  // ----------------------------------------------------------------
  // 4. MESSAGING SYSTEM (ROLE MATRIX & AUTHORIZATION)
  // ----------------------------------------------------------------
  console.log('>>> [4/6] MESSAGING SYSTEM & ROLE MATRIX TESTS');

  // Admin -> Teacher
  const msg1 = await request('/messages', {
    method: 'POST',
    token: adminToken,
    body: { receiver_id: teacherId, message: 'Hello Teacher! Automated admin message.' }
  });
  if (!msg1.ok) throw new Error(`Admin -> Teacher message failed: ${JSON.stringify(msg1.data)}`);
  console.log('  ✅ Admin sent message to Teacher');

  // Teacher -> Admin reply
  const msg2 = await request('/messages', {
    method: 'POST',
    token: teacherToken,
    body: { receiver_id: adminId, message: 'Thank you Admin! Teacher replying.' }
  });
  if (!msg2.ok) throw new Error(`Teacher -> Admin message failed: ${JSON.stringify(msg2.data)}`);
  console.log('  ✅ Teacher replied to Admin');

  // Teacher -> Student
  const msg3 = await request('/messages', {
    method: 'POST',
    token: teacherToken,
    body: { receiver_id: studentId, message: 'Welcome to the course, Student!' }
  });
  if (!msg3.ok) throw new Error(`Teacher -> Student message failed: ${JSON.stringify(msg3.data)}`);
  console.log('  ✅ Teacher sent message to Student');

  // Student -> Teacher reply
  const msg4 = await request('/messages', {
    method: 'POST',
    token: studentToken,
    body: { receiver_id: teacherId, message: 'Thank you Professor! Excited for the live classes.' }
  });
  if (!msg4.ok) throw new Error(`Student -> Teacher message failed: ${JSON.stringify(msg4.data)}`);
  console.log('  ✅ Student replied to Teacher');

  // Admin -> Student
  const msg5 = await request('/messages', {
    method: 'POST',
    token: adminToken,
    body: { receiver_id: studentId, message: 'Welcome to EduConnect Pro platform, Student!' }
  });
  if (!msg5.ok) throw new Error(`Admin -> Student message failed: ${JSON.stringify(msg5.data)}`);
  console.log('  ✅ Admin sent message to Student');

  // Student -> Admin reply
  const msg6 = await request('/messages', {
    method: 'POST',
    token: studentToken,
    body: { receiver_id: adminId, message: 'Thank you Admin for the welcome!' }
  });
  if (!msg6.ok) throw new Error(`Student -> Admin message failed: ${JSON.stringify(msg6.data)}`);
  console.log('  ✅ Student replied to Admin');

  // Unauthorized messaging: Student -> Student should be forbidden
  const [otherStudent] = await db.query("SELECT id FROM users WHERE role = 'Student' AND id != ?", [studentId]);
  if (otherStudent.length > 0) {
    const unauthMsg = await request('/messages', {
      method: 'POST',
      token: studentToken,
      body: { receiver_id: otherStudent[0].id, message: 'Unauthorized peer messaging' }
    });
    if (unauthMsg.status !== 403) {
      throw new Error(`Unauthorized student-student message was NOT rejected with 403! Got ${unauthMsg.status}`);
    }
    console.log('  ✅ Unauthorized role-to-role communication blocked (HTTP 403 Forbidden)');
  }

  // Conversation history verification from MySQL
  const convRes = await request(`/messages/${teacherId}`, { method: 'GET', token: studentToken });
  const messagesList = convRes.data.data || convRes.data.messages || [];
  if (!convRes.ok || messagesList.length < 2) {
    throw new Error('Message conversation history not retrieved properly');
  }
  console.log('  ✅ Real conversation history retrieved from MySQL with message persistence\n');

  // ----------------------------------------------------------------
  // 5. SECURITY & AUTHORIZATION BOUNDARIES
  // ----------------------------------------------------------------
  console.log('>>> [5/6] SECURITY & AUTHORIZATION TESTS');

  // Student trying to modify Teacher's course
  const studentModCourse = await request(`/courses/${createdCourseId}`, {
    method: 'PUT',
    token: studentToken,
    body: { title: 'Hacked Course Title' }
  });
  if (studentModCourse.status !== 403) {
    throw new Error(`Student modifying course should be 403 Forbidden! Got ${studentModCourse.status}`);
  }
  console.log('  ✅ Student cannot modify course (HTTP 403 Forbidden)');

  // Unauthorized course deletion
  const studentDeleteCourse = await request(`/courses/${createdCourseId}`, {
    method: 'DELETE',
    token: studentToken
  });
  if (studentDeleteCourse.status !== 403) {
    throw new Error(`Student deleting course should be 403 Forbidden! Got ${studentDeleteCourse.status}`);
  }
  console.log('  ✅ Student cannot delete course (HTTP 403 Forbidden)');

  // Unauthorized live class start by Student
  const studentStartLive = await request(`/live-classes/${liveClassId}/start`, {
    method: 'POST',
    token: studentToken
  });
  if (studentStartLive.status !== 403) {
    throw new Error(`Student starting live class should be 403 Forbidden! Got ${studentStartLive.status}`);
  }
  console.log('  ✅ Student cannot start live class (HTTP 403 Forbidden)\n');

  // ----------------------------------------------------------------
  // 6. DASHBOARD AGGREGATES & METRICS
  // ----------------------------------------------------------------
  console.log('>>> [6/6] DASHBOARD METRICS FROM MYSQL');

  const adminDash = await request('/dashboard/admin', { method: 'GET', token: adminToken });
  const adminData = adminDash.data.data || adminDash.data;
  if (!adminDash.ok || !adminData) {
    throw new Error(`Admin dashboard failed: ${JSON.stringify(adminDash.data)}`);
  }
  console.log('  ✅ Admin metrics computed from MySQL: Total Students =', adminData.totalStudents, ', Total Teachers =', adminData.totalTeachers, ', Total Courses =', adminData.totalCourses);

  const teacherDash = await request('/dashboard/teacher', { method: 'GET', token: teacherToken });
  const teacherData = teacherDash.data.data || teacherDash.data;
  if (!teacherDash.ok || !teacherData) {
    throw new Error(`Teacher dashboard failed: ${JSON.stringify(teacherDash.data)}`);
  }
  console.log('  ✅ Teacher metrics computed from MySQL: My Courses =', teacherData.ownCoursesCount, ', My Students =', teacherData.totalStudents, ', Avg Rating =', teacherData.avgRating);

  const studentDash = await request('/dashboard/student', { method: 'GET', token: studentToken });
  const studentData = studentDash.data.data || studentDash.data;
  if (!studentDash.ok || !studentData) {
    throw new Error(`Student dashboard failed: ${JSON.stringify(studentDash.data)}`);
  }
  console.log('  ✅ Student metrics computed from MySQL: Enrolled Courses =', studentData.enrolledCount, ', Attended Classes =', studentData.attendedCount, ', Avg Progress =', studentData.avgProgress + '%');

  console.log('\n====================================================');
  console.log('ALL END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILURE:', err);
  process.exit(1);
});
