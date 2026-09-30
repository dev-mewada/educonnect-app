import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

export default function BrowseCourses() {
  const { courses, enrollInCourse, isEnrolled } = useCourses();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const categories = ['All', 'Web Development', 'Artificial Intelligence', 'Cloud Computing', 'Design', 'Security'];

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEnroll = async (course) => {
    if (!user) {
      alert('Please log in as a student to enroll in courses.');
      return;
    }
    try {
      const success = await enrollInCourse(course.id);
      if (success) {
        setToastMsg(`Successfully enrolled in "${course.title}"!`);
        setTimeout(() => setToastMsg(null), 3000);
      } else {
        alert('You are already enrolled in this course.');
      }
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.3s ease' }}>
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '25px',
          right: '25px',
          backgroundColor: '#10b981',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
          zIndex: 9999,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="ri-checkbox-circle-fill" style={{ fontSize: '18px' }}></i>
          {toastMsg}
        </div>
      )}

      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 6px' }}>Explore Top Online Courses 🚀</h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Learn in-demand tech skills from industry leaders with live mentorship and projects.</p>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <i className="ri-search-line" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
          <input 
            type="text" 
            placeholder="Search by course title, instructor, or topic..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#3b82f6' : '#e2e8f0',
                backgroundColor: selectedCategory === cat ? '#3b82f6' : '#fff',
                color: selectedCategory === cat ? '#fff' : '#475569',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {filteredCourses.map(course => {
          const enrolled = user && (isEnrolled(course.id) || course.isEnrolled);

          return (
            <div 
              key={course.id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(6px)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase'
                }}>
                  {course.category}
                </span>

                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#d97706',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <i className="ri-star-fill"></i> {course.rating}
                </span>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '17px', color: '#1e293b', margin: '0 0 8px', lineHeight: 1.4 }}>
                  {course.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.5, flex: 1 }}>
                  {course.description.substring(0, 85)}...
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#64748b', fontSize: '12px', marginBottom: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <span><i className="ri-user-star-line"></i> {course.instructor}</span>
                  <span><i className="ri-time-line"></i> {course.duration}</span>
                  <span><i className="ri-file-list-3-line"></i> {course.lessonsCount} lessons</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Tuition:</span>
                    <h4 style={{ margin: 0, fontSize: '18px', color: '#059669', fontWeight: 700 }}>
                      ₹{course.price.toLocaleString()}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedCourse(course)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#475569',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Details
                    </button>

                    {enrolled ? (
                      <button
                        disabled
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#10b981',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'default',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <i className="ri-check-line"></i> Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#3b82f6',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }} onClick={() => setSelectedCourse(null)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <button 
              onClick={() => setSelectedCourse(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#64748b'
              }}
            >
              ×
            </button>

            <span style={{
              display: 'inline-block',
              background: '#eff6ff',
              color: '#3b82f6',
              fontWeight: 600,
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '20px',
              marginBottom: '10px'
            }}>
              {selectedCourse.category}
            </span>

            <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 10px' }}>
              {selectedCourse.title}
            </h2>

            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              {selectedCourse.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Instructor</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{selectedCourse.instructor}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Duration</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{selectedCourse.duration}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Lessons</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{selectedCourse.lessonsCount} Modules</p>
              </div>
            </div>

            <h3 style={{ fontSize: '17px', color: '#1e293b', marginBottom: '12px' }}>Curriculum & Syllabus</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px' }}>
              {selectedCourse.syllabus?.map((module, i) => (
                <div key={i} style={{ padding: '10px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ri-play-circle-line" style={{ color: '#3b82f6', fontSize: '16px' }}></i>
                  {module}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Price</span>
                <h3 style={{ margin: 0, fontSize: '22px', color: '#059669' }}>₹{selectedCourse.price.toLocaleString()}</h3>
              </div>

              {user && (isEnrolled(selectedCourse.id) || selectedCourse.isEnrolled) ? (
                <button
                  disabled
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#10b981',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'default'
                  }}
                >
                  Already Enrolled
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleEnroll(selectedCourse);
                    setSelectedCourse(null);
                  }}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#3b82f6',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
