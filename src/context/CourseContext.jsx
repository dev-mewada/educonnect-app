import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CourseContext = createContext();

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalize course record from backend to UI schema
  const normalizeCourse = (c) => {
    let syllabusList = [];
    if (Array.isArray(c.syllabus)) {
      syllabusList = c.syllabus;
    } else if (typeof c.syllabus === 'string') {
      try {
        syllabusList = JSON.parse(c.syllabus);
      } catch {
        syllabusList = c.syllabus.split('\n').filter(Boolean);
      }
    }

    return {
      id: c.id,
      courseId: c.id,
      title: c.title,
      category: c.category,
      instructor: c.instructor_name || c.instructor || 'Instructor',
      teacherId: c.teacher_id,
      price: Number(c.price) || 0,
      rating: Number(c.avg_rating) || 5.0,
      reviewsCount: Number(c.reviews_count) || 0,
      totalStudents: Number(c.total_students) || 0,
      duration: c.duration || '30 Hours',
      status: c.status || 'Published',
      thumbnail: c.image || 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=600&q=80',
      image: c.image,
      description: c.description || '',
      syllabus: syllabusList,
      isEnrolled: Boolean(c.is_enrolled),
      userProgress: c.user_progress
    };
  };

  // Normalize live class record
  const normalizeLiveClass = (lc) => ({
    id: lc.id,
    courseId: lc.course_id,
    courseTitle: lc.course_title || 'Course Lecture',
    teacherName: lc.teacher_name || 'Instructor',
    teacherEmail: lc.teacher_email,
    title: lc.title,
    description: lc.description || '',
    scheduledAt: lc.scheduled_at,
    meetingLink: lc.meeting_link,
    status: lc.status,
    attendees: lc.attendees_count ?? lc.real_attendees_count ?? 0,
    sessionCode: lc.session_code,
    isEnrolled: Boolean(lc.is_enrolled),
    hasAttended: Boolean(lc.has_attended),
    attendance: lc.attendance_info || null
  });

  // Normalize review
  const normalizeReview = (r) => ({
    id: r.id,
    courseId: r.course_id,
    courseTitle: r.course_title,
    studentName: r.student_name,
    rating: Number(r.rating) || 5,
    comment: r.comment || r.review || '',
    date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : ''
  });

  // Normalize enrollment
  const normalizeEnrollment = (e) => ({
    id: e.enrollment_id || e.id,
    courseId: e.course_id,
    progress: Number(e.progress) || 0,
    status: e.enrollment_status || e.status || 'Active',
    enrolledAt: e.enrolled_at ? new Date(e.enrolled_at).toISOString().split('T')[0] : '',
    studentEmail: e.student_email,
    studentName: e.student_name,
    title: e.title,
    category: e.category,
    image: e.image,
    duration: e.duration,
    instructorName: e.instructor_name
  });

  // Fetch all live MySQL data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);

      const [courseRes, liveRes, reviewRes, enrRes, msgRes] = await Promise.allSettled([
        api.getCourses(),
        api.getLiveClasses(),
        api.getReviews(),
        api.getMyEnrollments(),
        api.getConversations()
      ]);

      if (courseRes.status === 'fulfilled' && courseRes.value?.success && Array.isArray(courseRes.value.data)) {
        setCourses(courseRes.value.data.map(normalizeCourse));
      }

      if (liveRes.status === 'fulfilled' && liveRes.value?.success && Array.isArray(liveRes.value.data)) {
        setLiveClasses(liveRes.value.data.map(normalizeLiveClass));
      }

      if (reviewRes.status === 'fulfilled' && reviewRes.value?.success && Array.isArray(reviewRes.value.data)) {
        setReviews(reviewRes.value.data.map(normalizeReview));
      }

      if (enrRes.status === 'fulfilled' && enrRes.value?.success && Array.isArray(enrRes.value.data)) {
        setEnrollments(enrRes.value.data.map(normalizeEnrollment));
      }

      if (msgRes.status === 'fulfilled' && msgRes.value?.success && Array.isArray(msgRes.value.data)) {
        setMessages(msgRes.value.data);
      }
    } catch (err) {
      console.error('Error loading MySQL data in CourseContext:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Actions connecting directly to MySQL backend
  const addCourse = async (courseData) => {
    const payload = {
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      price: courseData.price,
      duration: courseData.duration,
      image: courseData.thumbnail || courseData.image,
      status: courseData.status || 'Published',
      syllabus: courseData.syllabus
    };
    const res = await api.createCourse(payload);
    if (res?.success) {
      await refreshData();
      return res.data;
    }
    throw new Error(res?.message || 'Failed to create course');
  };

  const updateCourse = async (id, updatedFields) => {
    const payload = {
      title: updatedFields.title,
      description: updatedFields.description,
      category: updatedFields.category,
      price: updatedFields.price,
      duration: updatedFields.duration,
      image: updatedFields.thumbnail || updatedFields.image,
      status: updatedFields.status,
      syllabus: updatedFields.syllabus
    };
    const res = await api.updateCourse(id, payload);
    if (res?.success) {
      await refreshData();
      return res.data;
    }
    throw new Error(res?.message || 'Failed to update course');
  };

  const deleteCourse = async (id) => {
    const res = await api.deleteCourse(id);
    if (res?.success) {
      await refreshData();
      return true;
    }
    throw new Error(res?.message || 'Failed to delete course');
  };

  const togglePublishCourse = async (id) => {
    const res = await api.togglePublishCourse(id);
    if (res?.success) {
      await refreshData();
      return res.status;
    }
    throw new Error(res?.message || 'Failed to toggle course publish status');
  };

  const enrollInCourse = async (courseId) => {
    const res = await api.enrollInCourse(courseId);
    if (res?.success) {
      await refreshData();
      return true;
    }
    return false;
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.courseId === courseId || e.courseId === Number(courseId));
  };

  const updateProgress = async (enrollmentId, progress) => {
    const res = await api.updateEnrollmentProgress(enrollmentId, progress);
    if (res?.success) {
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, progress: res.progress, status: res.status } : e));
      return true;
    }
    return false;
  };

  const scheduleLiveClass = async (liveData) => {
    const payload = {
      title: liveData.title,
      description: liveData.description,
      courseId: liveData.courseId,
      scheduledAt: liveData.scheduledAt,
      meetingLink: liveData.meetingLink
    };
    const res = await api.createLiveClass(payload);
    if (res?.success) {
      await refreshData();
      return res.data;
    }
    throw new Error(res?.message || 'Failed to schedule live class');
  };

  const startLiveClass = async (id) => {
    const res = await api.startLiveClass(id);
    if (res?.success) {
      await refreshData();
      return res;
    }
    throw new Error(res?.message || 'Failed to start live class');
  };

  const endLiveClass = async (id) => {
    const res = await api.endLiveClass(id);
    if (res?.success) {
      await refreshData();
      return res;
    }
    throw new Error(res?.message || 'Failed to end live class');
  };

  const checkInLiveClass = async (id, sessionCode) => {
    const res = await api.checkInLiveClass(id, sessionCode);
    if (res?.success) {
      await refreshData();
      return res;
    }
    throw new Error(res?.message || 'Check-in failed');
  };

  const addReview = async (reviewData) => {
    const res = await api.addReview(reviewData);
    if (res?.success) {
      await refreshData();
      return res.data;
    }
    throw new Error(res?.message || 'Failed to add review');
  };

  const sendMessage = async (receiverId, messageText) => {
    const res = await api.sendMessage(receiverId, messageText);
    if (res?.success) {
      await refreshData();
      return res.data;
    }
    throw new Error(res?.message || 'Failed to send message');
  };

  return (
    <CourseContext.Provider value={{
      courses,
      enrollments,
      liveClasses,
      reviews,
      messages,
      loading,
      refreshData,
      addCourse,
      updateCourse,
      deleteCourse,
      togglePublishCourse,
      enrollInCourse,
      isEnrolled,
      updateProgress,
      scheduleLiveClass,
      startLiveClass,
      endLiveClass,
      checkInLiveClass,
      addReview,
      sendMessage
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export const useCourses = () => useContext(CourseContext);
