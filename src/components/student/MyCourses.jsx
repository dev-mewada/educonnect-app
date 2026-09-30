import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

export default function MyCourses({ onBrowseClick }) {
  const { courses, enrollments, updateProgress } = useCourses();
  const { user } = useAuth();

  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  const enrolledCourseList = enrollments.map(enr => {
    const course = courses.find(c => c.id === enr.courseId) || {};
    return {
      ...course,
      id: course.id || enr.courseId,
      enrollmentId: enr.id,
      title: course.title || enr.title || 'Course',
      thumbnail: course.thumbnail || enr.image || 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=600&q=80',
      instructor: course.instructor || enr.instructorName || 'Instructor',
      category: course.category || enr.category || 'General',
      duration: course.duration || enr.duration || '30 Hours',
      progress: enr.progress,
      enrolledAt: enr.enrolledAt,
      syllabus: course.syllabus && course.syllabus.length > 0 ? course.syllabus : [
        'Module 1: Foundations & Architecture',
        'Module 2: Practical Implementation & Lab Work',
        'Module 3: Advanced Optimization & Production Standards'
      ]
    };
  });

  const handleLessonComplete = () => {
    if (!activeCourse) return;
    const totalLessons = activeCourse.syllabus?.length || 3;
    const step = Math.round(100 / totalLessons);
    const newProgress = Math.min(100, (activeCourse.progress || 0) + step);

    updateProgress(activeCourse.enrollmentId, newProgress);
    setActiveCourse(prev => ({ ...prev, progress: newProgress }));

    if (activeLessonIndex < totalLessons - 1) {
      setActiveLessonIndex(prev => prev + 1);
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 6px' }}>My Enrolled Courses 📚</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Continue where you left off, finish lectures, and track your milestone progress.</p>
        </div>

        <button 
          onClick={onBrowseClick}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className="ri-add-line"></i> Explore More Courses
        </button>
      </div>

      {enrolledCourseList.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <i className="ri-book-open-line" style={{ fontSize: '54px', color: '#94a3b8', display: 'block', marginBottom: '15px' }}></i>
          <h3 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 8px' }}>You haven't enrolled in any courses yet</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '450px', margin: '0 auto 20px' }}>
            Choose from industry-vetted courses in Full Stack, AI, Cloud, and UI/UX design to get started today!
          </p>
          <button 
            onClick={onBrowseClick}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Browse Course Catalog
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' }}>
          {enrolledCourseList.map(course => (
            <div 
              key={course.id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  Enrolled: {course.enrolledAt}
                </span>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '17px', color: '#1e293b', margin: '0 0 8px' }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                  Instructor: <strong style={{ color: '#334155' }}>{course.instructor}</strong>
                </p>

                {/* Progress Bar */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Course Progress</span>
                    <span style={{ fontWeight: 600, color: course.progress === 100 ? '#10b981' : '#3b82f6' }}>
                      {course.progress}%
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${course.progress}%`,
                      height: '100%',
                      background: course.progress === 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {course.lessonsCount} Total Modules
                  </span>

                  <button
                    onClick={() => {
                      setActiveCourse(course);
                      setActiveLessonIndex(0);
                    }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#4f46e5',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <i className="ri-play-circle-line"></i> Continue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Learning Player Modal */}
      {activeCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }} onClick={() => setActiveCourse(null)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '920px',
              width: '100%',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', background: '#1e293b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{activeCourse.title}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Progress: {activeCourse.progress}% Completed</span>
              </div>
              <button 
                onClick={() => setActiveCourse(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Video Player & Lecture details */}
              <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', background: '#f8fafc', overflowY: 'auto' }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  background: '#0f172a',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  marginBottom: '20px',
                  position: 'relative'
                }}>
                  <i className="ri-play-circle-fill" style={{ fontSize: '64px', color: '#3b82f6', cursor: 'pointer', transition: 'transform 0.2s' }}></i>
                  <span style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '10px' }}>
                    Lecture {activeLessonIndex + 1}: {activeCourse.syllabus?.[activeLessonIndex] || 'Lesson Stream'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                    {activeCourse.syllabus?.[activeLessonIndex]}
                  </h4>

                  <button
                    onClick={handleLessonComplete}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#10b981',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <i className="ri-checkbox-circle-line"></i> Mark as Completed
                  </button>
                </div>

                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
                  In this module, you will learn the core foundations and best practices implemented in modern software engineering. Follow along with the instructor code repository and complete the practice exercises.
                </p>
              </div>

              {/* Lesson Playlist Sidebar */}
              <div style={{ width: '320px', borderLeft: '1px solid #e2e8f0', background: '#fff', overflowY: 'auto', padding: '16px' }}>
                <h4 style={{ fontSize: '14px', color: '#475569', textTransform: 'uppercase', margin: '0 0 12px' }}>Course Syllabus</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeCourse.syllabus?.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveLessonIndex(idx)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        background: activeLessonIndex === idx ? '#eff6ff' : '#f8fafc',
                        border: '1px solid',
                        borderColor: activeLessonIndex === idx ? '#3b82f6' : '#e2e8f0',
                        color: activeLessonIndex === idx ? '#1d4ed8' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <i className={activeLessonIndex === idx ? "ri-play-fill" : "ri-file-text-line"} style={{ color: activeLessonIndex === idx ? '#3b82f6' : '#94a3b8' }}></i>
                      <span style={{ flex: 1 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
