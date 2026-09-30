import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.getTeachers();
      if (res?.success && Array.isArray(res.data)) {
        setTeachers(res.data);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = teachers.filter(t => {
    const name = t.name || '';
    const subject = t.subject || '';
    const email = t.email || '';
    const term = searchTerm.toLowerCase();

    const matchesSearch = name.toLowerCase().includes(term) || 
                          subject.toLowerCase().includes(term) ||
                          email.toLowerCase().includes(term);
    const approvalStatus = t.approval_status || (t.status === 'Active' ? 'Approved' : 'Pending');
    const matchesStatus = filterStatus === 'All' || approvalStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleApproval = async (id, currentApproval) => {
    const newApproval = currentApproval === 'Approved' ? 'Pending' : 'Approved';
    const newStatus = newApproval === 'Approved' ? 'Active' : 'Pending';
    try {
      const res = await api.updateTeacherStatus(id, newStatus, newApproval);
      if (res?.success) {
        setTeachers(prev => prev.map(t => t.id === id ? { ...t, approval_status: newApproval, status: newStatus } : t));
      } else {
        alert(res?.message || 'Failed to update teacher status');
      }
    } catch (err) {
      alert('Error updating teacher status: ' + err.message);
    }
  };

  const deleteTeacher = async (id) => {
    if (window.confirm('Are you sure you want to remove this faculty record?')) {
      try {
        const res = await api.deleteTeacher(id);
        if (res?.success) {
          setTeachers(prev => prev.filter(t => t.id !== id));
        } else {
          alert(res?.message || 'Failed to delete faculty');
        }
      } catch (err) {
        alert('Error deleting teacher: ' + err.message);
      }
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 5px' }}>Teacher Management</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Review faculty submissions, approval credentials, and course assignments from MySQL.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <i className="ri-search-line" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
            <input 
              type="text" 
              placeholder="Search faculty..." 
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
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading teachers from MySQL database...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '16px 20px' }}>Instructor</th>
                <th style={{ padding: '16px 20px' }}>Specialization</th>
                <th style={{ padding: '16px 20px' }}>Experience</th>
                <th style={{ padding: '16px 20px' }}>Active Courses</th>
                <th style={{ padding: '16px 20px' }}>Approval Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((t, index) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '15px'
                      }}>
                        {t.name ? t.name.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{t.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{t.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>{t.subject || 'General Studies'}</td>
                    <td style={{ padding: '14px 20px', color: '#475569' }}>{t.experience || 'Experienced'}</td>
                    <td style={{ padding: '14px 20px', color: '#2563eb', fontWeight: 600 }}>{t.active_courses || 0} Courses</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        background: (t.approval_status === 'Approved' || t.status === 'Active') ? '#dcfce7' : '#fef3c7',
                        color: (t.approval_status === 'Approved' || t.status === 'Active') ? '#16a34a' : '#d97706'
                      }}>
                        {t.approval_status || (t.status === 'Active' ? 'Approved' : 'Pending')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => toggleApproval(t.id, t.approval_status || (t.status === 'Active' ? 'Approved' : 'Pending'))} 
                        title={(t.approval_status === 'Approved' || t.status === 'Active') ? 'Revoke Approval' : 'Grant Approval'}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          fontSize: '18px', 
                          color: (t.approval_status === 'Approved' || t.status === 'Active') ? '#f59e0b' : '#10b981', 
                          marginRight: '12px' 
                        }}
                      >
                        <i className={(t.approval_status === 'Approved' || t.status === 'Active') ? 'ri-close-circle-line' : 'ri-checkbox-circle-line'}></i>
                      </button>
                      <button 
                        onClick={() => deleteTeacher(t.id)} 
                        title="Delete Faculty"
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
                    No faculty found matching your search.
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
