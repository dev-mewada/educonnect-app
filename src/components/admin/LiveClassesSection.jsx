import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function LiveClassesSection() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [attendanceModalClass, setAttendanceModalClass] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [liveRes, coursesRes] = await Promise.all([
        api.getLiveClasses(),
        api.getCourses()
      ]);

      if (liveRes?.success && Array.isArray(liveRes.data)) {
        setClasses(liveRes.data);
      }
      if (coursesRes?.success && Array.isArray(coursesRes.data)) {
        setCourses(coursesRes.data);
        if (coursesRes.data.length > 0 && !courseId) {
          setCourseId(coursesRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading live classes data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    try {
      setSubmitting(true);
      const res = await api.createLiveClass({
        title: title.trim(),
        courseId: parseInt(courseId, 10),
        scheduledAt: dateTime || 'Today, 06:00 PM',
        meetingLink: meetingLink.trim() || `https://meet.jit.si/educonnect-live-${Date.now()}`,
        description: description.trim()
      });

      if (res?.success) {
        setShowScheduleModal(false);
        setTitle('');
        setDateTime('');
        setMeetingLink('');
        setDescription('');
        await loadData();
      } else {
        alert(res?.message || 'Failed to schedule live class');
      }
    } catch (err) {
      alert('Error scheduling class: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartClass = async (id) => {
    try {
      const res = await api.startLiveClass(id);
      if (res?.success) {
        alert(`Live class is now LIVE!\n\nAttendance Session Code: ${res.sessionCode}\n\nShare this code with attending students to verify their presence.`);
        await loadData();
      } else {
        alert(res?.message || 'Failed to start class');
      }
    } catch (err) {
      alert('Error starting class: ' + err.message);
    }
  };

  const handleEndClass = async (id) => {
    if (window.confirm('Are you sure you want to end this live session? It will be marked Completed.')) {
      try {
        const res = await api.endLiveClass(id);
        if (res?.success) {
          alert(`Class ended successfully. Total attendance recorded: ${res.attendeesCount}`);
          await loadData();
        } else {
          alert(res?.message || 'Failed to end class');
        }
      } catch (err) {
        alert('Error ending class: ' + err.message);
      }
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Are you sure you want to cancel and remove this live class?')) {
      try {
        const res = await api.deleteLiveClass(id);
        if (res?.success) {
          setClasses(prev => prev.filter(c => c.id !== id));
        } else {
          alert(res?.message || 'Failed to delete live class');
        }
      } catch (err) {
        alert('Error deleting class: ' + err.message);
      }
    }
  };

  const openAttendanceModal = async (classObj) => {
    setAttendanceModalClass(classObj);
    try {
      setLoadingAttendance(true);
      const res = await api.getClassAttendance(classObj.id);
      if (res?.success && Array.isArray(res.data)) {
        setAttendanceList(res.data);
      } else {
        setAttendanceList([]);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendanceList([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 5px' }}>Live Classes Hub</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Schedule and monitor interactive live streams, generate attendance session codes, and inspect verified attendance.</p>
        </div>

        <button 
          type="button" 
          onClick={() => setShowScheduleModal(true)}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
          }}
        >
          <i className="ri-broadcast-line" style={{ fontSize: '18px' }}></i> Schedule Live Class
        </button>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading live classes from MySQL...</div>
        ) : classes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No live classes scheduled yet. Click "Schedule Live Class" to create one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '16px 20px' }}>Topic & Course</th>
                <th style={{ padding: '16px 20px' }}>Instructor</th>
                <th style={{ padding: '16px 20px' }}>Schedule Time</th>
                <th style={{ padding: '16px 20px' }}>Session Code</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px' }}>Attendance</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls, index) => (
                <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{cls.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{cls.course_title}</div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#334155', fontWeight: 500 }}>{cls.teacher_name || 'Faculty'}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{cls.scheduled_at}</td>
                  <td style={{ padding: '14px 20px' }}>
                    {cls.session_code ? (
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, padding: '3px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: '6px' }}>
                        {cls.session_code}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      background: cls.status === 'Live' ? '#fee2e2' : cls.status === 'Completed' ? '#f1f5f9' : '#fef3c7',
                      color: cls.status === 'Live' ? '#dc2626' : cls.status === 'Completed' ? '#64748b' : '#d97706',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {cls.status === 'Live' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s infinite' }}></span>}
                      {cls.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button 
                      onClick={() => openAttendanceModal(cls)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#334155' }}
                    >
                      <i className="ri-user-shared-line"></i> {cls.real_attendees_count ?? cls.attendees_count ?? 0} Checked-In
                    </button>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    {cls.status === 'Upcoming' && (
                      <button 
                        onClick={() => handleStartClass(cls.id)} 
                        title="Start Live Class"
                        style={{ padding: '4px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginRight: '8px' }}
                      >
                        Start
                      </button>
                    )}
                    {cls.status === 'Live' && (
                      <button 
                        onClick={() => handleEndClass(cls.id)} 
                        title="End Live Class"
                        style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginRight: '8px' }}
                      >
                        End
                      </button>
                    )}
                    <a 
                      href={cls.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 600, fontSize: '13px', marginRight: '12px' }}
                    >
                      Join
                    </a>
                    <button 
                      onClick={() => handleDeleteClass(cls.id)} 
                      title="Cancel Class"
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

      {/* Schedule Class Modal */}
      {showScheduleModal && (
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
          <div style={{ background: '#fff', borderRadius: '18px', width: '480px', maxWidth: '90%', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Schedule Live Class</h3>
              <i className="ri-close-line" onClick={() => setShowScheduleModal(false)} style={{ fontSize: '24px', cursor: 'pointer', color: '#64748b' }}></i>
            </div>

            <form onSubmit={handleSchedule}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Session Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Live Q&A and Project Review"
                  style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Select Course</label>
                <select 
                  value={courseId} 
                  onChange={(e) => setCourseId(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff' }}
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Date & Start Time</label>
                <input 
                  type="text" 
                  value={dateTime} 
                  onChange={(e) => setDateTime(e.target.value)} 
                  placeholder="e.g. Today, 05:00 PM or 2026-10-05 17:00"
                  style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Meeting / Session Link</label>
                <input 
                  type="url" 
                  value={meetingLink} 
                  onChange={(e) => setMeetingLink(e.target.value)} 
                  placeholder="https://meet.jit.si/educonnect-live-mern (or custom meeting URL)"
                  style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Description / Agenda</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Topics covered in this session..."
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Scheduling in MySQL...' : 'Schedule Live Class'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Inspection Modal */}
      {attendanceModalClass && (
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
          <div style={{ background: '#fff', borderRadius: '18px', width: '560px', maxWidth: '90%', padding: '28px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1e293b' }}>Attendance Record</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{attendanceModalClass.title}</p>
              </div>
              <i className="ri-close-line" onClick={() => setAttendanceModalClass(null)} style={{ fontSize: '24px', cursor: 'pointer', color: '#64748b' }}></i>
            </div>

            {loadingAttendance ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading verified attendance from MySQL...</div>
            ) : attendanceList.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No students have checked in for this session yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 14px' }}>Student</th>
                    <th style={{ padding: '10px 14px' }}>Checked-In Time</th>
                    <th style={{ padding: '10px 14px' }}>Session Code Used</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>
                        {a.student_name}
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>{a.student_email}</div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>
                        {a.joined_at ? new Date(a.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                        {a.session_code_used || 'N/A'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: 600 }}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
