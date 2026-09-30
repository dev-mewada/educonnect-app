import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function TeacherLiveScheduler() {
  const { courses, liveClasses, scheduleLiveClass, startLiveClass, endLiveClass, refreshData } = useCourses();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceModalClass, setAttendanceModalClass] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Form state
  const ownCourses = courses.filter(c => 
    c.teacherId === user?.id || 
    (user?.email === 'teacher@educonnect.com' && (c.teacherId === 2 || c.instructor?.includes('Teacher')))
  );

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(ownCourses[0]?.id || courses[0]?.id || '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.jit.si/educonnect-live-' + Date.now());
  const [description, setDescription] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const ownLiveClasses = liveClasses.filter(lc => 
    lc.teacherEmail === user?.email || 
    lc.teacherName === user?.name ||
    lc.teacher_id === user?.id
  );

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    try {
      setScheduling(true);
      await scheduleLiveClass({
        title: title.trim(),
        courseId: parseInt(courseId, 10),
        scheduledAt: scheduledAt || 'Today, 06:00 PM',
        meetingLink: meetingLink.trim(),
        description: description.trim()
      });

      setIsModalOpen(false);
      setTitle('');
      setScheduledAt('');
      setDescription('');
    } catch (err) {
      alert(err.message || 'Failed to schedule live class');
    } finally {
      setScheduling(false);
    }
  };

  const handleStartClass = async (id) => {
    try {
      const res = await startLiveClass(id);
      alert(`Class started successfully!\n\nAttendance Session Code: ${res.sessionCode}\n\nAnnounce this code to attending students so they can check in.`);
    } catch (err) {
      alert(err.message || 'Failed to start class');
    }
  };

  const handleEndClass = async (id) => {
    if (window.confirm('Are you sure you want to end this live session? It will be marked Completed.')) {
      try {
        const res = await endLiveClass(id);
        alert(`Live class ended. Total attendance recorded: ${res.attendeesCount}`);
      } catch (err) {
        alert(err.message || 'Failed to end class');
      }
    }
  };

  const openAttendanceModal = async (classObj) => {
    setAttendanceModalClass(classObj);
    try {
      setLoadingAttendance(true);
      const res = await api.getClassAttendance(classObj.id);
      if (res?.success && Array.isArray(res.data)) {
        setAttendeesList(res.data);
      } else {
        setAttendeesList([]);
      }
    } catch (err) {
      console.error('Error fetching class attendance:', err);
      setAttendeesList([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 6px' }}>Live Class Scheduler 📡</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Host interactive webinars, code review sessions, generate session codes, and record attendance in MySQL.</p>
        </div>

        <button
          onClick={() => {
            if (ownCourses.length > 0 && !courseId) {
              setCourseId(ownCourses[0].id);
            }
            setIsModalOpen(true);
          }}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: '#ef4444',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
          }}
        >
          <i className="ri-broadcast-line"></i> Schedule New Live Session
        </button>
      </div>

      {/* Classes Table / List */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {ownLiveClasses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No live classes scheduled in your catalog yet. Click "Schedule New Live Session" above.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '16px 20px' }}>Session Title</th>
                <th style={{ padding: '16px 20px' }}>Associated Course</th>
                <th style={{ padding: '16px 20px' }}>Date & Time</th>
                <th style={{ padding: '16px 20px' }}>Session Code</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px' }}>Attendance</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ownLiveClasses.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#1e293b' }}>
                    {item.title}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#475569' }}>
                    {item.courseTitle}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>
                    {item.scheduledAt}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {item.sessionCode ? (
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, padding: '3px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: '6px' }}>
                        {item.sessionCode}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Not active</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: item.status === 'Live' ? '#fee2e2' : item.status === 'Upcoming' ? '#e0f2fe' : '#f1f5f9',
                      color: item.status === 'Live' ? '#dc2626' : item.status === 'Upcoming' ? '#0284c7' : '#64748b'
                    }}>
                      {item.status === 'Live' ? '● Live Now' : item.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button
                      onClick={() => openAttendanceModal(item)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#334155' }}
                    >
                      <i className="ri-user-shared-line"></i> {item.attendees} Checked-In
                    </button>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {item.status === 'Upcoming' && (
                        <button
                          onClick={() => handleStartClass(item.id)}
                          style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Start Live
                        </button>
                      )}

                      {item.status === 'Live' && (
                        <button
                          onClick={() => handleEndClass(item.id)}
                          style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          End Class
                        </button>
                      )}

                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}
                      >
                        Join Room
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Schedule Modal */}
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
              maxWidth: '550px',
              width: '100%',
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
              Schedule Interactive Live Session
            </h3>

            <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Code Review: High Performance Custom Hooks"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Select Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}
                >
                  {(ownCourses.length > 0 ? ownCourses : courses).map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Scheduled Date & Time
                </label>
                <input
                  type="text"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  placeholder="e.g. Today, 05:00 PM or Oct 10, 06:30 PM"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Virtual Classroom Room URL
                </label>
                <input
                  type="url"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.jit.si/..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Agenda / Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key concepts to be discussed..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
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
                  disabled={scheduling}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: scheduling ? 'not-allowed' : 'pointer',
                    opacity: scheduling ? 0.7 : 1
                  }}
                >
                  {scheduling ? 'Scheduling in MySQL...' : 'Schedule Live Session'}
                </button>
              </div>
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
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1e293b' }}>Verified Attendees Log</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{attendanceModalClass.title}</p>
              </div>
              <i className="ri-close-line" onClick={() => setAttendanceModalClass(null)} style={{ fontSize: '24px', cursor: 'pointer', color: '#64748b' }}></i>
            </div>

            {loadingAttendance ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading verified attendance from MySQL...</div>
            ) : attendeesList.length === 0 ? (
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
                  {attendeesList.map(a => (
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
