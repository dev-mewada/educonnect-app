const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('educonnect_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // ==================== AUTH ====================
  async login(email, password, role) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        localStorage.setItem('educonnect_token', data.token);
      }
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error. Please ensure backend is running.', error: err.message };
    }
  },

  async register(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error. Please ensure backend is running.', error: err.message };
    }
  },

  async getMe() {
    try {
      const token = localStorage.getItem('educonnect_token');
      if (!token) {
        return { success: false, status: 401, message: 'No authentication token found' };
      }
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, status: 500, message: 'Server connection error verifying session', error: err.message };
    }
  },

  async getRegistrationStatus(email) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/registration-status?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error', error: err.message };
    }
  },

  async verifyRegistrationOtp(email, otp) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error', error: err.message };
    }
  },

  async resendRegistrationOtp(email) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error', error: err.message };
    }
  },

  async completeRegistration(email) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/complete-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error', error: err.message };
    }
  },

  async forgotPassword(email) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error', error: err.message };
    }
  },

  async verifyResetOtp(email, otp) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error', error: err.message };
    }
  },

  async resetPassword(email, password, otp) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp })
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error', error: err.message };
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error', error: err.message };
    }
  },

  async updateProfile(profileData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, message: 'Server connection error', error: err.message };
    }
  },

  // ==================== COURSES ====================
  async getCourses(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/courses${qs ? '?' + qs : ''}`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getCourseById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async createCourse(courseData) {
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(courseData)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async updateCourse(id, courseData) {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(courseData)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async togglePublishCourse(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${id}/publish`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async deleteCourse(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getCourseEnrollments(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${id}/enrollments`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ==================== ENROLLMENTS ====================
  async enrollInCourse(courseId) {
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ courseId })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getMyEnrollments() {
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/my`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async updateEnrollmentProgress(enrollmentId, progress) {
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/progress`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ progress })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async checkEnrollment(courseId) {
    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/check/${courseId}`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ==================== LIVE CLASSES ====================
  async getLiveClasses(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/live-classes${qs ? '?' + qs : ''}`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getLiveClassById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async createLiveClass(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async updateLiveClass(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async deleteLiveClass(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async startLiveClass(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}/start`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async endLiveClass(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}/end`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async checkInLiveClass(id, sessionCode) {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}/check-in`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ sessionCode })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getClassAttendance(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/${id}/attendance`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getMyAttendance() {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/my-attendance`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ==================== MESSAGES ====================
  async getConversations() {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/conversations`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getMessageContacts() {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/contacts`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getMessages(contactId) {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${contactId}`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async sendMessage(receiverId, message) {
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ receiverId, message })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async markMessagesRead(contactId) {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/read/${contactId}`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ==================== REVIEWS ====================
  async getReviews(courseId) {
    try {
      const qs = courseId ? `?courseId=${courseId}` : '';
      const res = await fetch(`${API_BASE_URL}/reviews${qs}`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async addReview(reviewData) {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reviewData)
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ==================== DASHBOARD STATS ====================
  async getAdminDashboard() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/admin`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getTeacherDashboard() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/teacher`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getStudentDashboard() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/student`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ==================== STUDENTS ====================
  async getStudents() {
    try {
      const res = await fetch(`${API_BASE_URL}/students`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async updateStudentStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async deleteStudent(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ==================== TEACHERS ====================
  async getTeachers() {
    try {
      const res = await fetch(`${API_BASE_URL}/teachers`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async updateTeacherStatus(id, status, approvalStatus) {
    try {
      const res = await fetch(`${API_BASE_URL}/teachers/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, approvalStatus })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async deleteTeacher(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/teachers/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // ==================== NOTIFICATIONS & ADMIN APPROVALS ====================
  async getNotifications() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getHeaders() });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getUnreadNotificationCount() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, { headers: getHeaders() });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async markNotificationRead(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return await res.json().catch(() => ({}));
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async markAllNotificationsRead() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: getHeaders()
      });
      return await res.json().catch(() => ({}));
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getRegistrationDetails(applicantId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/registrations/${applicantId}`, {
        headers: getHeaders()
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async approveRegistration(applicantId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/registrations/${applicantId}/approve`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async rejectRegistration(applicantId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/registrations/${applicantId}/reject`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async deletePendingRegistration(applicantId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/registrations/${applicantId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json().catch(() => ({}));
      return { ...data, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
