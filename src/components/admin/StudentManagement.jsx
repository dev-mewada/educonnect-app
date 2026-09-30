import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents();
      if (res?.success && Array.isArray(res.data)) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const name = student.name || '';
    const email = student.email || '';
    const id = String(student.id || '');
    const term = searchTerm.toLowerCase();

    const matchesSearch = name.toLowerCase().includes(term) || 
                          email.toLowerCase().includes(term) ||
                          id.toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.updateStudentStatus(id, newStatus);
      if (res?.success) {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      } else {
        alert(res?.message || 'Failed to update student status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to remove this student account?')) {
      try {
        const res = await api.deleteStudent(id);
        if (res?.success) {
          setStudents(prev => prev.filter(s => s.id !== id));
        } else {
          alert(res?.message || 'Failed to delete student');
        }
      } catch (err) {
        alert('Error deleting student: ' + err.message);
      }
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 5px' }}>Student Management</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>View, filter, manage, and inspect all registered student profiles from MySQL.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <i className="ri-search-line" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 14px 10px 38px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff', cursor: 'pointer' }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading students from MySQL database...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '16px 20px' }}>Student</th>
                <th style={{ padding: '16px 20px' }}>User ID</th>
                <th style={{ padding: '16px 20px' }}>Enrolled Courses</th>
                <th style={{ padding: '16px 20px' }}>Joined Date</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, index) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s', background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '15px'
                      }}>
                        {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{s.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#475569', fontWeight: 500 }}>STU-{s.id}</td>
                    <td style={{ padding: '14px 20px', color: '#475569' }}>{s.enrolled_courses || 0} Courses</td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>{s.created_at ? new Date(s.created_at).toISOString().split('T')[0] : 'N/A'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        background: s.status === 'Active' ? '#dcfce7' : '#fee2e2',
                        color: s.status === 'Active' ? '#16a34a' : '#dc2626'
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => toggleStatus(s.id, s.status)} 
                        title={s.status === 'Active' ? 'Deactivate Student' : 'Activate Student'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: s.status === 'Active' ? '#f59e0b' : '#16a34a', marginRight: '10px' }}
                      >
                        <i className={s.status === 'Active' ? 'ri-pause-circle-line' : 'ri-play-circle-line'}></i>
                      </button>
                      <button 
                        onClick={() => deleteStudent(s.id)} 
                        title="Delete Student"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#dc2626' }}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
