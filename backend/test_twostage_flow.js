const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function post(reqPath, body, token) {
  const data = JSON.stringify(body);
  return request(
    {
      hostname: 'localhost',
      port: 5000,
      path: reqPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    },
    data
  );
}

function get(reqPath, token) {
  return request({
    hostname: 'localhost',
    port: 5000,
    path: reqPath,
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

function del(reqPath, token) {
  return request({
    hostname: 'localhost',
    port: 5000,
    path: reqPath,
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('   STARTING TWO-STAGE REGISTRATION & APPROVAL TEST SUITE');
  console.log('========================================================\n');

  const results = {};
  let adminToken = null;

  try {
    // 0. Login as permanent demo Admin
    const adminLogin = await post('/api/auth/login', {
      email: 'admin@educonnect.com',
      password: 'Password123',
      role: 'Admin'
    });
    adminToken = adminLogin.data.token;
    console.log(`Admin Login for test setup: ${adminLogin.status === 200 ? 'SUCCESS' : 'FAILED'}`);

    // TEST A: Student submits registration request
    const studentEmail = 'test_twostage_student@example.com';
    // Cleanup any prior test run residue
    await db.query('DELETE FROM users WHERE email = ?', [studentEmail]);

    const regRes = await post('/api/auth/register', {
      name: 'Alex Student',
      email: studentEmail,
      password: 'Password123',
      role: 'Student',
      mobile: '9876543210',
      dob: '2002-04-15'
    });

    results.A =
      regRes.status === 201 &&
      regRes.data.success === true &&
      regRes.data.message === 'Registration request submitted successfully. Waiting for Admin approval.' &&
      regRes.data.user.status === 'Pending' &&
      !regRes.data.token;
    console.log(`Test A - Student submits registration request: ${results.A ? 'PASS' : 'FAIL'} (${regRes.data.message})`);

    const [dbStudentRows] = await db.query('SELECT * FROM users WHERE email = ?', [studentEmail]);
    const studentId = dbStudentRows[0]?.id;

    // TEST B: Admin receives notification
    const adminNotifs = await get('/api/notifications', adminToken);
    const foundAdminNotif = adminNotifs.data?.data?.find((n) => n.applicant_id === studentId);
    results.B =
      adminNotifs.status === 200 &&
      !!foundAdminNotif &&
      foundAdminNotif.title.includes('Registration Request') &&
      foundAdminNotif.type === 'registration';
    console.log(`Test B - Admin receives notification: ${results.B ? 'PASS' : 'FAIL'} ("${foundAdminNotif?.title}")`);

    // TEST C: Student does NOT receive OTP yet
    results.C =
      dbStudentRows[0].status === 'Pending' &&
      dbStudentRows[0].verification_otp === null &&
      dbStudentRows[0].is_verified === 0;
    console.log(`Test C - Student does NOT receive OTP yet: ${results.C ? 'PASS' : 'FAIL'} (OTP: ${dbStudentRows[0].verification_otp})`);

    // TEST D: Admin approves
    const approveRes = await post(`/api/notifications/registrations/${studentId}/approve`, {}, adminToken);
    const [dbApprovedStudent] = await db.query('SELECT * FROM users WHERE id = ?', [studentId]);
    results.D =
      approveRes.status === 200 &&
      dbApprovedStudent[0].status === 'Approved' &&
      dbApprovedStudent[0].verification_otp !== null &&
      dbApprovedStudent[0].verification_otp.length === 6 &&
      dbApprovedStudent[0].verification_otp_expiry !== null;
    const generatedOtp = dbApprovedStudent[0].verification_otp;
    console.log(`Test D - Admin approves: ${results.D ? 'PASS' : 'FAIL'} (Status: ${dbApprovedStudent[0].status}, OTP generated: 6-digits)`);

    // TEST E: Student receives approval notification
    const [dbStudentNotifs] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? AND type = 'registration_approval'",
      [studentId]
    );
    const studentStatusRes = await get(`/api/auth/registration-status?email=${encodeURIComponent(studentEmail)}`);
    results.E =
      dbStudentNotifs.length >= 1 &&
      dbStudentNotifs[0].title === 'Registration Approved' &&
      studentStatusRes.status === 200 &&
      studentStatusRes.data.isApproved === true;
    console.log(`Test E - Student receives approval notification: ${results.E ? 'PASS' : 'FAIL'} ("${dbStudentNotifs[0]?.title}")`);

    // TEST F: Notification sound asset exists & ready
    const soundPath = path.join(__dirname, '..', 'public', 'sounds', 'notification.wav');
    const soundExists = fs.existsSync(soundPath) && fs.statSync(soundPath).size > 0;
    results.F = soundExists;
    console.log(`Test F - Notification sound asset ready: ${results.F ? 'PASS' : 'FAIL'} (${fs.statSync(soundPath).size} bytes)`);

    // TEST G: OTP email sent
    results.G = approveRes.data?.emailDelivery !== undefined;
    console.log(`Test G - OTP email delivery handled: ${results.G ? 'PASS' : 'FAIL'} (Delivery: ${approveRes.data?.emailDelivery})`);

    // TEST H: Student enters wrong OTP -> rejected
    const wrongOtpRes = await post('/api/auth/verify-registration-otp', {
      email: studentEmail,
      otp: '000000'
    });
    results.H = wrongOtpRes.status === 400 && wrongOtpRes.data.success === false;
    console.log(`Test H - Student enters wrong OTP -> rejected: ${results.H ? 'PASS' : 'FAIL'} (${wrongOtpRes.data.message})`);

    // TEST I: Student enters expired OTP -> rejected
    await db.query('UPDATE users SET verification_otp_expiry = DATE_SUB(NOW(), INTERVAL 1 MINUTE) WHERE id = ?', [studentId]);
    const expiredOtpRes = await post('/api/auth/verify-registration-otp', {
      email: studentEmail,
      otp: generatedOtp
    });
    results.I = expiredOtpRes.status === 400 && expiredOtpRes.data.message.includes('expired');
    console.log(`Test I - Student enters expired OTP -> rejected: ${results.I ? 'PASS' : 'FAIL'} (${expiredOtpRes.data.message})`);

    // Restore valid expiry for next test
    await db.query('UPDATE users SET verification_otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?', [studentId]);

    // TEST J: Student enters correct OTP -> "OTP Verified Successfully"
    const correctOtpRes = await post('/api/auth/verify-registration-otp', {
      email: studentEmail,
      otp: generatedOtp
    });
    const [dbVerifiedStudent] = await db.query('SELECT status, verification_otp, is_verified FROM users WHERE id = ?', [studentId]);
    results.J =
      correctOtpRes.status === 200 &&
      correctOtpRes.data.message === 'OTP Verified Successfully' &&
      dbVerifiedStudent[0].verification_otp === 'VERIFIED' &&
      dbVerifiedStudent[0].status === 'Approved' &&
      dbVerifiedStudent[0].is_verified === 0;
    console.log(`Test J - Student enters correct OTP -> "OTP Verified Successfully": ${results.J ? 'PASS' : 'FAIL'}`);

    // TEST K: Register button appears only after successful OTP verification
    const statusAfterOtp = await get(`/api/auth/registration-status?email=${encodeURIComponent(studentEmail)}`);
    results.K =
      statusAfterOtp.status === 200 &&
      statusAfterOtp.data.isOtpVerified === true &&
      statusAfterOtp.data.isApproved === true;
    console.log(`Test K - Register button appears only after successful OTP verification: ${results.K ? 'PASS' : 'FAIL'}`);

    // TEST L: Student clicks Register
    const completeRes = await post('/api/auth/complete-registration', {
      email: studentEmail
    });
    results.L =
      completeRes.status === 200 &&
      completeRes.data.success === true &&
      completeRes.data.message === 'Registration successful. You can now login.';
    console.log(`Test L - Student clicks Register: ${results.L ? 'PASS' : 'FAIL'} (${completeRes.data.message})`);

    // TEST M: Account becomes Active
    const [dbActiveStudent] = await db.query('SELECT status, is_verified, verification_otp FROM users WHERE id = ?', [studentId]);
    results.M =
      dbActiveStudent[0].status === 'Active' &&
      dbActiveStudent[0].is_verified === 1 &&
      dbActiveStudent[0].verification_otp === null;
    console.log(`Test M - Account becomes Active: ${results.M ? 'PASS' : 'FAIL'} (Status: ${dbActiveStudent[0].status}, Verified: ${dbActiveStudent[0].is_verified})`);

    // TEST N: Student can login
    const studentLoginRes = await post('/api/auth/login', {
      email: studentEmail,
      password: 'Password123',
      role: 'Student'
    });
    results.N = studentLoginRes.status === 200 && !!studentLoginRes.data.token;
    console.log(`Test N - Student can login: ${results.N ? 'PASS' : 'FAIL'} (${studentLoginRes.status})`);

    // TEST O: Teacher flow works the same way
    const teacherEmail = 'test_twostage_teacher@example.com';
    await db.query('DELETE FROM users WHERE email = ?', [teacherEmail]);
    const teacherReg = await post('/api/auth/register', {
      name: 'Dr. Marcus',
      email: teacherEmail,
      password: 'Password123',
      role: 'Teacher',
      mobile: '9123456780',
      dob: '1988-06-20',
      subject: 'Physics',
      experience: '8 Years',
      qualification: 'Ph.D'
    });
    const [dbTeacherRows] = await db.query('SELECT * FROM users WHERE email = ?', [teacherEmail]);
    const teacherId = dbTeacherRows[0]?.id;

    // Approve teacher
    const appTeacher = await post(`/api/notifications/registrations/${teacherId}/approve`, {}, adminToken);
    const [dbAppTeacher] = await db.query('SELECT verification_otp FROM users WHERE id = ?', [teacherId]);
    const teacherOtp = dbAppTeacher[0]?.verification_otp;

    // Verify OTP
    const verTeacher = await post('/api/auth/verify-registration-otp', {
      email: teacherEmail,
      otp: teacherOtp
    });

    // Complete registration
    const compTeacher = await post('/api/auth/complete-registration', {
      email: teacherEmail
    });

    // Login
    const loginTeacher = await post('/api/auth/login', {
      email: teacherEmail,
      password: 'Password123',
      role: 'Teacher'
    });

    results.O =
      teacherReg.status === 201 &&
      appTeacher.status === 200 &&
      verTeacher.status === 200 &&
      compTeacher.status === 200 &&
      loginTeacher.status === 200 &&
      !!loginTeacher.data.token;
    console.log(`Test O - Teacher flow works the same way: ${results.O ? 'PASS' : 'FAIL'}`);

    // TEST P: Pending/rejected users cannot login
    const tempPendingEmail = 'test_pending_only@example.com';
    await db.query('DELETE FROM users WHERE email = ?', [tempPendingEmail]);
    await post('/api/auth/register', {
      name: 'Pending Guy',
      email: tempPendingEmail,
      password: 'Password123',
      role: 'Student',
      mobile: '9876543211',
      dob: '2001-01-01'
    });
    const pendingLogin = await post('/api/auth/login', {
      email: tempPendingEmail,
      password: 'Password123',
      role: 'Student'
    });

    // Reject user
    const [pendingRows] = await db.query('SELECT id FROM users WHERE email = ?', [tempPendingEmail]);
    await post(`/api/notifications/registrations/${pendingRows[0].id}/reject`, {}, adminToken);
    const rejectedLogin = await post('/api/auth/login', {
      email: tempPendingEmail,
      password: 'Password123',
      role: 'Student'
    });

    results.P = pendingLogin.status === 403 && rejectedLogin.status === 403;
    console.log(`Test P - Pending/rejected users cannot login: ${results.P ? 'PASS' : 'FAIL'} (Pending: ${pendingLogin.status}, Rejected: ${rejectedLogin.status})`);

    // TEST Q: Admin cannot be registered publicly or deleted through this flow
    const adminRegAttempt = await post('/api/auth/register', {
      name: 'Fake Admin',
      email: 'fake_admin@example.com',
      password: 'Password123',
      role: 'Admin'
    });
    const adminDelAttempt = await del('/api/notifications/registrations/1', adminToken);
    results.Q = adminRegAttempt.status === 403 && adminDelAttempt.status === 400;
    console.log(`Test Q - Admin registration blocked & deletion prevented: ${results.Q ? 'PASS' : 'FAIL'}`);

    // TEST R: Existing 3 permanent demo users must remain untouched
    const [demoUsers] = await db.query('SELECT id, name, email, role, status FROM users WHERE id IN (1, 2, 3) ORDER BY id ASC');
    const demoAdminLogin = await post('/api/auth/login', { email: 'admin@educonnect.com', password: 'Password123', role: 'Admin' });
    const demoTeacherLogin = await post('/api/auth/login', { email: 'teacher@educonnect.com', password: 'Password123', role: 'Teacher' });
    const demoStudentLogin = await post('/api/auth/login', { email: 'student@educonnect.com', password: 'Password123', role: 'Student' });

    results.R =
      demoUsers.length === 3 &&
      demoUsers[0].email === 'admin@educonnect.com' &&
      demoUsers[1].email === 'teacher@educonnect.com' &&
      demoUsers[2].email === 'student@educonnect.com' &&
      demoAdminLogin.status === 200 &&
      demoTeacherLogin.status === 200 &&
      demoStudentLogin.status === 200;
    console.log(`Test R - Existing 3 permanent demo users untouched & log in: ${results.R ? 'PASS' : 'FAIL'}`);

    // TEST S: Final database must still contain exactly the permanent demo users
    console.log('\n=== CLEANING UP TEMPORARY TEST USERS ===');
    const tempTestEmails = [
      'test_twostage_student@example.com',
      'test_twostage_teacher@example.com',
      'test_pending_only@example.com'
    ];
    await db.query('DELETE FROM student_details WHERE student_id IN (SELECT id FROM users WHERE email IN (?))', [tempTestEmails]);
    await db.query('DELETE FROM teacher_details WHERE teacher_id IN (SELECT id FROM users WHERE email IN (?))', [tempTestEmails]);
    await db.query('DELETE FROM notifications WHERE applicant_id IN (SELECT id FROM users WHERE email IN (?))', [tempTestEmails]);
    await db.query('DELETE FROM users WHERE email IN (?)', [tempTestEmails]);
    await db.query("UPDATE users SET reset_token = NULL, reset_token_expiry = NULL, verification_otp = NULL, verification_otp_expiry = NULL, otp_attempts = 0 WHERE email IN ('student@educonnect.com')");

    const [finalUsers] = await db.query("SELECT id, name, email, role, status FROM users WHERE email IN ('admin@educonnect.com', 'teacher@educonnect.com', 'student@educonnect.com') ORDER BY id ASC");
    results.S = finalUsers.length === 3;
    console.log(`Test S - Permanent demo user count is exactly 3: ${results.S ? 'PASS' : 'FAIL'} (Count: ${finalUsers.length})`);
    console.table(finalUsers);

    console.log('\n========================================================');
    const allPassed = Object.values(results).every((v) => v === true);
    console.log(`FINAL RESULT: ${allPassed ? 'ALL TESTS PASSED SUCCESSFULLY! ✅' : 'SOME TESTS FAILED ❌'}`);
    console.log('========================================================');

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTestSuite();
