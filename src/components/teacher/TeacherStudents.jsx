import React, { useState, useEffect } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function TeacherStudents() {
  const { courses } = useCourses();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const ownCourses = courses.filter(c => 
    c.teacherId === user?.id || 
    (user?.email === 'teacher@educonnect.com' && (c.teacherId === 2 || c.instructor?.includes('Teacher')))
  );

  useEffect(() => {
    let isMounted = true;

    const loadRoster = async () => {
      try {
        setLoading(true);
        const roster = [];

        for (const course of ownCourses) {
          const res = await api.getCourseEnrollments(course.id);
          if (res?.success && Array.isArray(res.data)) {
            for (const enr of res.data) {
              roster.push({
                id: enr.id,
                name: enr.student_name,
                email: enr.student_email,
                mobile: enr.student_mobile,
                course: course.title,
                progress: enr.progress,
                joined: enr.enrolled_at ? new Date(enr.enrolled_at).toISOString().split('T')[0] : 'N/A',
                status: enr.status
              });
            }
          }
        }

        if (isMounted) {
          setStudents(roster);
        }
      } catch (err) {
        console.error('Error loading enrolled students:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (ownCourses.length > 0) {
      loadRoster();
    } else {
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [ownCourses.length]);

  const filtered = students.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.course || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 6px' }}>Enrolled Students Roster 👥</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Review student progress milestones, active submissions, and course completion percentages from MySQL.</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <i className="ri-search-line" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
          <input 
            type="text" 
            placeholder="Search students or courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading student roster from MySQL...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            {searchTerm ? 'No students match your search criteria.' : 'No students enrolled in your courses yet.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '16px 20px' }}>Student</th>
                <th style={{ padding: '16px 20px' }}>Enrolled Course</th>
                <th style={{ padding: '16px 20px' }}>Joined Date</th>
                <th style={{ padding: '16px 20px' }}>Learning Progress</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                        fontSize: '14px'
                      }}>
                        {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>{s.name}</h5>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{s.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#334155' }}>
                    {s.course}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>
                    {s.joined}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, maxWidth: '100px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.progress}%`, height: '100%', background: s.progress === 100 ? '#10b981' : '#3b82f6' }}></div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{s.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: s.status === 'Completed' || s.progress === 100 ? '#dcfce7' : '#e0f2fe',
                      color: s.status === 'Completed' || s.progress === 100 ? '#15803d' : '#0369a1'
                    }}>
                      {s.progress === 100 ? 'Completed' : s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
