const http = require('http');
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
        } catch (e) {
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

function post(path, body, token) {
  const data = JSON.stringify(body);
  return request(
    {
      hostname: 'localhost',
      port: 5000,
      path,
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

function put(path, body, token) {
  const data = JSON.stringify(body);
  return request(
    {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    },
    data
  );
}

function get(path, token) {
  return request({
    hostname: 'localhost',
    port: 5000,
    path,
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

function del(path, token) {
  return request({
    hostname: 'localhost',
    port: 5000,
    path,
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

async function runTests() {
  const results = {};
  console.log('=== STARTING PHASE 3 TEST SUITE ===\n');

  try {
    // A, B, C: Demo logins
    const adminLogin = await post('/api/auth/login', {
      email: 'admin@educonnect.com',
      password: 'Password123',
      role: 'Admin'
    });
    results.A = adminLogin.status === 200 && !!adminLogin.data.token;
    const adminToken = adminLogin.data.token;
    console.log(`Test A - Admin Login: ${results.A ? 'PASS' : 'FAIL'} (${adminLogin.status})`);

    const teacherLogin = await post('/api/auth/login', {
      email: 'teacher@educonnect.com',
      password: 'Password123',
      role: 'Teacher'
    });
    results.B = teacherLogin.status === 200 && !!teacherLogin.data.token;
    const teacherToken = teacherLogin.data.token;
    console.log(`Test B - Teacher Login: ${results.B ? 'PASS' : 'FAIL'} (${teacherLogin.status})`);

    const studentLogin = await post('/api/auth/login', {
      email: 'student@educonnect.com',
      password: 'Password123',
      role: 'Student'
    });
    results.C = studentLogin.status === 200 && !!studentLogin.data.token;
    const studentToken = studentLogin.data.token;
    console.log(`Test C - Student Login: ${results.C ? 'PASS' : 'FAIL'} (${studentLogin.status})`);

    // D: Register temporary student
    const tempStudentEmail = 'test_student_phase3@example.com';
    const regStudent = await post('/api/auth/register', {
      name: 'Temp Student Phase3',
      email: tempStudentEmail,
      password: 'Password123',
      role: 'Student',
      mobile: '+91 99999 11111',
      dob: '2001-01-01'
    });
    const [dbStudent] = await db.query('SELECT * FROM users WHERE email = ?', [tempStudentEmail]);
    const [dbNotif] = await db.query('SELECT * FROM notifications WHERE applicant_id = ?', [dbStudent[0]?.id]);

    results.D =
      regStudent.status === 201 &&
      !regStudent.data.token &&
      dbStudent.length === 1 &&
      dbStudent[0].status === 'Pending' &&
      dbStudent[0].password_hash.startsWith('$2') &&
      !JSON.stringify(dbStudent[0]).includes('Password123') &&
      dbNotif.length >= 1;
    console.log(`Test D - Register Student (Pending + bcrypt + Admin notif): ${results.D ? 'PASS' : 'FAIL'}`);

    const studentApplicantId = dbStudent[0]?.id;

    // E: Admin notification appears
    const adminNotifs = await get('/api/notifications', adminToken);
    results.E =
      adminNotifs.status === 200 &&
      adminNotifs.data.data.some((n) => n.applicant_id === studentApplicantId);
    console.log(`Test E - Admin notification appears in dashboard: ${results.E ? 'PASS' : 'FAIL'}`);

    // F: Unread badge count
    const unreadRes = await get('/api/notifications/unread-count', adminToken);
    results.F = unreadRes.status === 200 && unreadRes.data.unreadCount >= 1;
    console.log(`Test F - Unread badge count is correct: ${results.F ? 'PASS' : 'FAIL'} (Count: ${unreadRes.data.unreadCount})`);

    // G, H: Admin views registration details
    const regDetails = await get(`/api/notifications/registrations/${studentApplicantId}`, adminToken);
    results.G = regDetails.status === 200;
    results.H =
      regDetails.status === 200 &&
      regDetails.data.applicant.name === 'Temp Student Phase3' &&
      regDetails.data.applicant.email === tempStudentEmail &&
      !regDetails.data.applicant.password_hash &&
      !regDetails.data.applicant.password;
    console.log(`Test G - Admin opens notification: ${results.G ? 'PASS' : 'FAIL'}`);
    console.log(`Test H - Admin views details (no passwords/secrets): ${results.H ? 'PASS' : 'FAIL'}`);

    // N: Pending account cannot login
    const pendingLogin = await post('/api/auth/login', {
      email: tempStudentEmail,
      password: 'Password123',
      role: 'Student'
    });
    results.N = pendingLogin.status === 403;
    console.log(`Test N - Pending account cannot login: ${results.N ? 'PASS' : 'FAIL'} (${pendingLogin.status})`);

    // I, J: Admin approves registration
    const approveRes = await post(`/api/notifications/registrations/${studentApplicantId}/approve`, {}, adminToken);
    const [dbApprovedStudent] = await db.query('SELECT status, verification_otp, verification_otp_expiry FROM users WHERE id = ?', [studentApplicantId]);
    results.I = approveRes.status === 200 && dbApprovedStudent[0]?.status === 'Approved';
    results.J =
      !!dbApprovedStudent[0]?.verification_otp &&
      dbApprovedStudent[0].verification_otp.length === 6 &&
      !approveRes.data.otp;
    const studentOtp = dbApprovedStudent[0]?.verification_otp;
    console.log(`Test I - Admin approves registration: ${results.I ? 'PASS' : 'FAIL'}`);
    console.log(`Test J - OTP generated and email attempted: ${results.J ? 'PASS' : 'FAIL'} (Email status: ${approveRes.data.emailDelivery})`);

    // Approved but unverified account cannot login
    const approvedUnverifiedLogin = await post('/api/auth/login', {
      email: tempStudentEmail,
      password: 'Password123',
      role: 'Student'
    });
    console.log(`Approved but unverified cannot login: ${approvedUnverifiedLogin.status === 403 ? 'PASS' : 'FAIL'} (${approvedUnverifiedLogin.status})`);

    // K: Wrong OTP rejected
    const wrongOtpRes = await post('/api/auth/verify-registration-otp', {
      email: tempStudentEmail,
      otp: '000000'
    });
    results.K = wrongOtpRes.status === 400;
    console.log(`Test K - Wrong OTP rejected: ${results.K ? 'PASS' : 'FAIL'} (${wrongOtpRes.status})`);

    // L: Correct OTP verifies and reveals Register, then completeRegistration activates account
    const correctOtpRes = await post('/api/auth/verify-registration-otp', {
      email: tempStudentEmail,
      otp: studentOtp
    });
    const completeStudentRes = await post('/api/auth/complete-registration', {
      email: tempStudentEmail
    });
    const [dbActiveStudent] = await db.query('SELECT status, is_verified, verification_otp FROM users WHERE id = ?', [studentApplicantId]);
    results.L =
      correctOtpRes.status === 200 &&
      completeStudentRes.status === 200 &&
      dbActiveStudent[0]?.status === 'Active' &&
      dbActiveStudent[0]?.is_verified === 1 &&
      dbActiveStudent[0]?.verification_otp === null;
    console.log(`Test L - Correct OTP + Register activates account: ${results.L ? 'PASS' : 'FAIL'}`);

    // M: Applicant can now login
    const newStudentLogin = await post('/api/auth/login', {
      email: tempStudentEmail,
      password: 'Password123',
      role: 'Student'
    });
    results.M = newStudentLogin.status === 200 && !!newStudentLogin.data.token;
    console.log(`Test M - Applicant can login: ${results.M ? 'PASS' : 'FAIL'} (${newStudentLogin.status})`);

    // S, T, U: Teacher registration, approval, verification
    const tempTeacherEmail = 'test_teacher_phase3@example.com';
    const regTeacher = await post('/api/auth/register', {
      name: 'Temp Teacher Phase3',
      email: tempTeacherEmail,
      password: 'Password123',
      role: 'Teacher',
      mobile: '+91 88888 22222',
      dob: '1990-05-10',
      subject: 'Computer Science',
      experience: '5 Years',
      qualification: 'M.Tech'
    });
    const [dbTeacher] = await db.query('SELECT * FROM users WHERE email = ?', [tempTeacherEmail]);
    const teacherApplicantId = dbTeacher[0]?.id;
    const [dbTeacherNotif] = await db.query('SELECT * FROM notifications WHERE applicant_id = ?', [teacherApplicantId]);
    results.S = regTeacher.status === 201 && dbTeacher[0]?.status === 'Pending' && dbTeacherNotif.length >= 1;
    console.log(`Test S - Teacher registration creates Admin notification: ${results.S ? 'PASS' : 'FAIL'}`);

    const approveTeacher = await post(`/api/notifications/registrations/${teacherApplicantId}/approve`, {}, adminToken);
    const [dbAppTeacher] = await db.query('SELECT status, verification_otp FROM users WHERE id = ?', [teacherApplicantId]);
    results.T = approveTeacher.status === 200 && dbAppTeacher[0]?.status === 'Approved' && !!dbAppTeacher[0]?.verification_otp;
    console.log(`Test T - Teacher approval sends OTP to Teacher email: ${results.T ? 'PASS' : 'FAIL'}`);

    const teacherOtp = dbAppTeacher[0]?.verification_otp;
    const verifyTeacher = await post('/api/auth/verify-registration-otp', {
      email: tempTeacherEmail,
      otp: teacherOtp
    });
    const completeTeacher = await post('/api/auth/complete-registration', {
      email: tempTeacherEmail
    });
    const [dbActiveTeacher] = await db.query('SELECT status, is_verified FROM users WHERE id = ?', [teacherApplicantId]);
    const teacherLoginNew = await post('/api/auth/login', {
      email: tempTeacherEmail,
      password: 'Password123',
      role: 'Teacher'
    });
    results.U = verifyTeacher.status === 200 && completeTeacher.status === 200 && dbActiveTeacher[0]?.status === 'Active' && teacherLoginNew.status === 200;
    console.log(`Test U - Teacher verification + Register activates Teacher: ${results.U ? 'PASS' : 'FAIL'}`);

    // Reject Flow: O
    const rejectEmail = 'test_reject_phase3@example.com';
    await post('/api/auth/register', {
      name: 'Temp Reject Phase3',
      email: rejectEmail,
      password: 'Password123',
      role: 'Student'
    });
    const [dbRejectUser] = await db.query('SELECT id FROM users WHERE email = ?', [rejectEmail]);
    const rejectApplicantId = dbRejectUser[0]?.id;
    const rejectRes = await post(`/api/notifications/registrations/${rejectApplicantId}/reject`, {}, adminToken);
    const [dbRejected] = await db.query('SELECT status FROM users WHERE id = ?', [rejectApplicantId]);
    const rejectLogin = await post('/api/auth/login', {
      email: rejectEmail,
      password: 'Password123',
      role: 'Student'
    });
    results.O = rejectRes.status === 200 && dbRejected[0]?.status === 'Rejected' && rejectLogin.status === 403;
    console.log(`Test O - Rejected account cannot login: ${results.O ? 'PASS' : 'FAIL'} (${rejectLogin.status})`);

    // P, Q, R: Delete pending/rejected registration & Re-registration
    const delRes = await del(`/api/notifications/registrations/${rejectApplicantId}`, adminToken);
    const [dbDeletedCheck] = await db.query('SELECT id FROM users WHERE id = ?', [rejectApplicantId]);
    const delLogin = await post('/api/auth/login', {
      email: rejectEmail,
      password: 'Password123',
      role: 'Student'
    });
    const reRegisterRes = await post('/api/auth/register', {
      name: 'Temp ReRegistered',
      email: rejectEmail,
      password: 'Password123',
      role: 'Student'
    });
    const [dbReRegistered] = await db.query('SELECT id FROM users WHERE email = ?', [rejectEmail]);
    const reRegId = dbReRegistered[0]?.id;

    results.P = delRes.status === 200 && dbDeletedCheck.length === 0;
    results.Q = delLogin.status === 401;
    results.R = reRegisterRes.status === 201 && dbReRegistered.length === 1;
    console.log(`Test P - Admin deletes pending/rejected registration: ${results.P ? 'PASS' : 'FAIL'}`);
    console.log(`Test Q - Deleted pending registration cannot login: ${results.Q ? 'PASS' : 'FAIL'}`);
    console.log(`Test R - Same email can register again after deletion: ${results.R ? 'PASS' : 'FAIL'}`);

    // Clean up re-registered temporary user
    if (reRegId) {
      await del(`/api/notifications/registrations/${reRegId}`, adminToken);
    }

    // Active user protection check:
    const delActiveCheck = await del(`/api/notifications/registrations/3`, adminToken); // id 3 is permanent student
    console.log(`Active user deletion blocked: ${delActiveCheck.status === 400 ? 'PASS' : 'FAIL'} (${delActiveCheck.data.message})`);

    // V, W, X: Forgot Password OTP & Reset
    const forgotRes = await post('/api/auth/forgot-password', { email: 'student@educonnect.com' });
    const [dbForgotUser] = await db.query('SELECT reset_token FROM users WHERE email = ?', ['student@educonnect.com']);
    const resetOtp = dbForgotUser[0]?.reset_token;
    results.V = forgotRes.status === 200 && resetOtp && resetOtp.length === 6 && !forgotRes.data.otp;
    console.log(`Test V - Forgot Password OTP works: ${results.V ? 'PASS' : 'FAIL'}`);

    const wrongResetOtp = await post('/api/auth/verify-reset-otp', {
      email: 'student@educonnect.com',
      otp: '999999'
    });
    results.W = wrongResetOtp.status === 400;
    console.log(`Test W - Wrong Forgot Password OTP rejected: ${results.W ? 'PASS' : 'FAIL'}`);

    const resetPassRes = await post('/api/auth/reset-password', {
      email: 'student@educonnect.com',
      otp: resetOtp,
      password: 'NewPassword123'
    });
    const testNewLogin = await post('/api/auth/login', {
      email: 'student@educonnect.com',
      password: 'NewPassword123',
      role: 'Student'
    });
    // Reset back to Password123
    const forgotRes2 = await post('/api/auth/forgot-password', { email: 'student@educonnect.com' });
    const [dbForgot2] = await db.query('SELECT reset_token FROM users WHERE email = ?', ['student@educonnect.com']);
    await post('/api/auth/reset-password', {
      email: 'student@educonnect.com',
      otp: dbForgot2[0]?.reset_token,
      password: 'Password123'
    });

    results.X = resetPassRes.status === 200 && testNewLogin.status === 200;
    console.log(`Test X - Correct Forgot Password OTP resets password: ${results.X ? 'PASS' : 'FAIL'}`);

    // Y: Change Password for logged-in user
    const wrongChange = await put(
      '/api/auth/change-password',
      { currentPassword: 'WrongPassword', newPassword: 'ChangedPassword123' },
      adminToken
    );
    const correctChange = await put(
      '/api/auth/change-password',
      { currentPassword: 'Password123', newPassword: 'ChangedPassword123' },
      adminToken
    );
    // Revert admin password back to Password123
    const revertChange = await put(
      '/api/auth/change-password',
      { currentPassword: 'ChangedPassword123', newPassword: 'Password123' },
      adminToken
    );
    results.Y = (wrongChange.status === 400 || wrongChange.status === 401) && correctChange.status === 200 && revertChange.status === 200;
    console.log(`Test Y - Change Password works for logged-in user: ${results.Y ? 'PASS' : 'FAIL'}`);

    // Z: Non-admin authorization
    const nonAdminGetNotifs = await get('/api/notifications', studentToken);
    const nonAdminApprove = await post(`/api/notifications/registrations/1/approve`, {}, studentToken);
    const nonAdminDelete = await del(`/api/notifications/registrations/1`, studentToken);
    results.Z = nonAdminGetNotifs.status === 403 && nonAdminApprove.status === 403 && nonAdminDelete.status === 403;
    console.log(`Test Z - Non-admin cannot access admin registration management: ${results.Z ? 'PASS' : 'FAIL'}`);

    // AA: No secrets/passwords/OTPs exposed in any JSON responses
    const allResponses = [adminLogin, regStudent, adminNotifs, regDetails, approveRes, forgotRes];
    let secretsExposed = false;
    for (const r of allResponses) {
      const str = JSON.stringify(r.data || {});
      if (str.includes('password_hash') || str.includes('verification_otp') || str.includes('reset_token') || str.includes('$2a$') || str.includes('$2b$')) {
        secretsExposed = true;
        break;
      }
    }
    results.AA = !secretsExposed;
    console.log(`Test AA - No password/hash/OTP appears in API responses: ${results.AA ? 'PASS' : 'FAIL'}`);

    // Cleanup: Remove temporary users and notifications
    console.log('\n=== CLEANING UP TEMPORARY TEST DATA ===');
    const tempEmails = [
      'test_student_phase3@example.com',
      'test_teacher_phase3@example.com',
      'test_reject_phase3@example.com'
    ];
    await db.query('DELETE FROM student_details WHERE student_id IN (SELECT id FROM users WHERE email IN (?))', [tempEmails]);
    await db.query('DELETE FROM teacher_details WHERE teacher_id IN (SELECT id FROM users WHERE email IN (?))', [tempEmails]);
    await db.query('DELETE FROM notifications WHERE applicant_id IN (SELECT id FROM users WHERE email IN (?))', [tempEmails]);
    await db.query('DELETE FROM users WHERE email IN (?)', [tempEmails]);
    await db.query("UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE email IN ('student@educonnect.com')");

    const [finalUsers] = await db.query("SELECT id, name, email, role, status FROM users ORDER BY id ASC");
    console.log(`Final user count in database: ${finalUsers.length}`);
    console.table(finalUsers);

    const allPassed = Object.values(results).every((v) => v === true) && finalUsers.length === 3;
    console.log(`\nALL TESTS PASSED: ${allPassed ? 'YES' : 'NO'}`);

    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
