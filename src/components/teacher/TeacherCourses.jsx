import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

export default function TeacherCourses() {
  const { courses, addCourse, updateCourse, deleteCourse, togglePublishCourse } = useCourses();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [price, setPrice] = useState(2999);
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80');
  const [status, setStatus] = useState('Published');
  const [syllabusText, setSyllabusText] = useState('Module 1: Introduction\nModule 2: Core Concepts\nModule 3: Advanced Projects');
  const [saving, setSaving] = useState(false);

  const ownCourses = courses.filter(c => 
    c.teacherId === user?.id || 
    (user?.email === 'teacher@educonnect.com' && (c.teacherId === 2 || c.instructor?.includes('Teacher')))
  );

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle('');
    setCategory('Web Development');
    setPrice(2999);
    setDescription('');
    setThumbnail('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80');
    setStatus('Published');
    setSyllabusText('Module 1: Introduction\nModule 2: Core Concepts\nModule 3: Advanced Projects');
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCourse(c);
    setTitle(c.title);
    setCategory(c.category);
    setPrice(c.price);
    setDescription(c.description);
    setThumbnail(c.thumbnail);
    setStatus(c.status);
    setSyllabusText(c.syllabus ? c.syllabus.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const syllabusArray = syllabusText.split('\n').filter(line => line.trim().length > 0);

    try {
      setSaving(true);
      if (editingCourse) {
        await updateCourse(editingCourse.id, {
          title,
          category,
          price: Number(price),
          description,
          thumbnail,
          status,
          syllabus: syllabusArray
        });
      } else {
        await addCourse({
          title,
          category,
          price: Number(price),
          description,
          thumbnail,
          status,
          duration: '30 Hours',
          syllabus: syllabusArray
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (courseId) => {
    try {
      await togglePublishCourse(courseId);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (course) => {
    if (window.confirm(`Are you sure you want to permanently delete "${course.title}"?`)) {
      try {
        await deleteCourse(course.id);
      } catch (err) {
        alert(err.message || 'Failed to delete course');
      }
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 6px' }}>Course Studio & Curriculum 📖</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Design, author, publish, and manage all your curriculum modules in MySQL.</p>
        </div>

        <button
          onClick={openCreateModal}
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
            gap: '8px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          <i className="ri-add-circle-line"></i> Create New Course
        </button>
      </div>

      {/* Course List Grid */}
      {ownCourses.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', margin: '0 0 16px' }}>No courses in your catalog yet. Click "Create New Course" above to add one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '25px' }}>
          {ownCourses.map(course => (
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
              <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                <span 
                  onClick={() => handleTogglePublish(course.id)}
                  title="Click to toggle publish status"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: course.status === 'Published' ? '#dcfce7' : '#fef9c3',
                    color: course.status === 'Published' ? '#15803d' : '#854d0e'
                  }}
                >
                  {course.status}
                </span>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}>{course.category}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>₹{course.price.toLocaleString()}</span>
                </div>

                <h3 style={{ fontSize: '17px', color: '#1e293b', margin: '0 0 10px', lineHeight: 1.4 }}>
                  {course.title}
                </h3>

                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px', flex: 1 }}>
                  {course.description ? (course.description.substring(0, 90) + '...') : ''}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '16px' }}>
                  <span><i className="ri-user-line"></i> {course.totalStudents} Enrolled</span>
                  <span><i className="ri-star-fill" style={{ color: '#f59e0b' }}></i> {course.rating}</span>
                  <span><i className="ri-file-list-line"></i> {course.syllabus?.length || 0} Modules</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openEditModal(course)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <i className="ri-edit-line"></i> Edit
                  </button>

                  <button
                    onClick={() => handleTogglePublish(course.id)}
                    title={course.status === 'Published' ? 'Unpublish Course' : 'Publish Course'}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: course.status === 'Published' ? '#d97706' : '#16a34a',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {course.status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDelete(course)}
                    title="Delete Course"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#fee2e2',
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Course Modal */}
      {isModalOpen && (
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
        }} onClick={() => setIsModalOpen(false)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 20px' }}>
              {editingCourse ? 'Edit Course Details' : 'Create New Course'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Artificial Intelligence"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Design">Design</option>
                    <option value="Security">Security</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Price (₹ INR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2999"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Thumbnail Image URL</label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Course Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive learning roadmap and takeaways..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Course Modules / Syllabus (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  placeholder="Module 1: Introduction\nModule 2: Core Concepts"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ 
                    padding: '10px 24px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: '#3b82f6', 
                    color: '#fff', 
                    fontWeight: 600, 
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving in MySQL...' : (editingCourse ? 'Save Changes' : 'Publish Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
