import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Web Development');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('30 Hours');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, teachersRes] = await Promise.all([
        api.getCourses(),
        api.getTeachers()
      ]);

      if (coursesRes?.success && Array.isArray(coursesRes.data)) {
        setCourses(coursesRes.data);
      }
      if (teachersRes?.success && Array.isArray(teachersRes.data)) {
        setTeachers(teachersRes.data);
        if (teachersRes.data.length > 0 && !newTeacherId) {
          setNewTeacherId(teachersRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading course management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCourses = courses.filter(c => {
    const title = c.title || '';
    const category = c.category || '';
    const teacher = c.instructor_name || c.instructor || '';
    const term = searchTerm.toLowerCase();
    return title.toLowerCase().includes(term) ||
           category.toLowerCase().includes(term) ||
           teacher.toLowerCase().includes(term);
  });

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.createCourse({
        title: newTitle.trim(),
        category: newCategory,
        teacher_id: newTeacherId || undefined,
        price: newPrice ? parseFloat(newPrice) : 0,
        duration: newDuration,
        description: newDescription,
        status: 'Published'
      });

      if (res?.success) {
        setShowAddModal(false);
        setNewTitle('');
        setNewPrice('');
        setNewDescription('');
        setActionMessage('Course created successfully!');
        setTimeout(() => setActionMessage(''), 3000);
        await loadData();
      } else {
        alert(res?.message || 'Failed to create course');
      }
    } catch (err) {
      alert('Error creating course: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await api.togglePublishCourse(id);
      if (res?.success) {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: res.status } : c));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to permanently remove this course?')) {
      try {
        const res = await api.deleteCourse(id);
        if (res?.success) {
          setCourses(prev => prev.filter(c => c.id !== id));
        } else {
          alert(res?.message || 'Failed to delete course');
        }
      } catch (err) {
        alert('Error deleting course: ' + err.message);
      }
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 5px' }}>Course Management</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Create, publish, inspect enrollment metrics, and manage syllabus content.</p>
        </div>

        {actionMessage && (
          <div style={{ padding: '8px 16px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
            {actionMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <i className="ri-search-line" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 14px 10px 38px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <button 
            type="button" 
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
            }}
          >
            <i className="ri-add-line" style={{ fontSize: '18px' }}></i> Add Course
          </button>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading courses from MySQL database...</div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No courses found. Click "Add Course" to create one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '16px 20px' }}>Course Title</th>
                <th style={{ padding: '16px 20px' }}>Category</th>
                <th style={{ padding: '16px 20px' }}>Instructor</th>
                <th style={{ padding: '16px 20px' }}>Price</th>
                <th style={{ padding: '16px 20px' }}>Enrolled</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c, index) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                  <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={c.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'} 
                      alt={c.title} 
                      style={{ width: '48px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} 
                    />
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.title}</div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569' }}>{c.category}</td>
                  <td style={{ padding: '14px 20px', color: '#1e293b', fontWeight: 500 }}>{c.instructor_name || c.instructor || 'Faculty'}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#2563eb' }}>{Number(c.price) > 0 ? `₹${Number(c.price).toLocaleString()}` : 'Free'}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{c.total_students || 0} Learners</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span 
                      onClick={() => handleTogglePublish(c.id)}
                      title="Click to toggle publish status"
                      style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: c.status === 'Published' ? '#dcfce7' : '#f1f5f9',
                        color: c.status === 'Published' ? '#16a34a' : '#64748b'
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteCourse(c.id)} 
                      title="Delete Course"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#dc2626' }}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{ background: '#fff', borderRadius: '18px', width: '500px', maxWidth: '90%', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Add New Course</h3>
              <i className="ri-close-line" onClick={() => setShowAddModal(false)} style={{ fontSize: '24px', cursor: 'pointer', color: '#64748b' }}></i>
            </div>

            <form onSubmit={handleAddCourse}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Course Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. Master Artificial Intelligence & Robotics"
                  style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Category</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff' }}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Design">Design</option>
                  <option value="Security">Security</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Programming">Programming</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Assign Faculty Instructor</label>
                <select 
                  value={newTeacherId} 
                  onChange={(e) => setNewTeacherId(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff' }}
                  required
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subject || t.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Price (₹ INR)</label>
                  <input 
                    type="number" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)} 
                    placeholder="e.g. 2999"
                    style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Duration</label>
                  <input 
                    type="text" 
                    value={newDuration} 
                    onChange={(e) => setNewDuration(e.target.value)} 
                    placeholder="e.g. 35 Hours"
                    style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Description</label>
                <textarea 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                  placeholder="Provide detailed course objectives..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Creating in Database...' : 'Create Course in MySQL'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
