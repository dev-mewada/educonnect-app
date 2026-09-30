import React, { useState, useEffect } from 'react';
import { useCourses } from '../../context/CourseContext';
import { api } from '../../services/api';

export default function StudentLiveClasses() {
  const { liveClasses, checkInLiveClass, refreshData } = useCourses();
  const [filter, setFilter] = useState('All');
  const [sessionCodes, setSessionCodes] = useState({});
  const [checkingInId, setCheckingInId] = useState(null);
  const [checkInMessages, setCheckInMessages] = useState({});
  const [myAttendanceHistory, setMyAttendanceHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (filter === 'History') {
      setLoadingHistory(true);
      api.getMyAttendance()
        .then(res => {
          if (res?.success && Array.isArray(res.data)) {
            setMyAttendanceHistory(res.data);
          }
        })
        .catch(err => console.error('Error fetching attendance history:', err))
        .finally(() => setLoadingHistory(false));
    }
  }, [filter]);

  const handleCodeChange = (id, val) => {
    setSessionCodes(prev => ({ ...prev, [id]: val }));
  };

  const handleCheckIn = async (item) => {
    const code = sessionCodes[item.id]?.trim();
    if (!code) {
      alert('Please enter the session check-in code provided by your instructor.');
      return;
    }

    try {
      setCheckingInId(item.id);
      const res = await checkInLiveClass(item.id, code);
      if (res?.success) {
        setCheckInMessages(prev => ({
          ...prev,
          [item.id]: { type: 'success', text: '✓ Attendance Recorded! Marked Present.' }
        }));
        await refreshData();
      }
    } catch (err) {
      setCheckInMessages(prev => ({
        ...prev,
        [item.id]: { type: 'error', text: err.message || 'Check-in failed' }
      }));
    } finally {
      setCheckingInId(null);
    }
  };

  const filtered = liveClasses.filter(c => {
    if (filter === 'All' || filter === 'History') return true;
    return c.status === filter;
  });

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 6px' }}>Interactive Live Classes 🔴</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Attend live sessions, verify presence with session check-in codes, and track attendance in MySQL.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Live', 'Upcoming', 'Completed', 'History'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: filter === tab ? '#ef4444' : '#e2e8f0',
                backgroundColor: filter === tab ? '#ef4444' : '#fff',
                color: filter === tab ? '#fff' : '#475569'
              }}
            >
              {tab === 'Live' ? '🔴 Live Now' : tab === 'History' ? '📋 My Attendance' : tab}
            </button>
          ))}
        </div>
      </div>

      {filter === 'History' ? (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '16px' }}>Verified Attendance Log</h3>
          {loadingHistory ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading verified attendance history...</div>
          ) : myAttendanceHistory.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No live class attendance recorded yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Class Title</th>
                  <th style={{ padding: '12px 16px' }}>Course</th>
                  <th style={{ padding: '12px 16px' }}>Instructor</th>
                  <th style={{ padding: '12px 16px' }}>Check-In Time</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myAttendanceHistory.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{a.class_title}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{a.course_title}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{a.teacher_name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {a.joined_at ? new Date(a.joined_at).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: 700 }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map(item => {
            const isLive = item.status === 'Live';
            const isAttended = item.hasAttended;

            return (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: isLive ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  boxShadow: isLive ? '0 10px 25px rgba(239, 68, 68, 0.15)' : '0 4px 20px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1', background: '#eef2ff', padding: '4px 10px', borderRadius: '12px' }}>
                    {item.courseTitle}
                  </span>

                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: isLive ? '#fee2e2' : item.status === 'Upcoming' ? '#e0f2fe' : '#f1f5f9',
                    color: isLive ? '#dc2626' : item.status === 'Upcoming' ? '#0284c7' : '#64748b'
                  }}>
                    {isLive ? '● Live Now' : item.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', color: '#1e293b', margin: '0 0 10px', lineHeight: 1.4 }}>
                  {item.title}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="ri-user-star-line" style={{ color: '#4f46e5' }}></i>
                    <span>Instructor: <strong style={{ color: '#334155' }}>{item.teacherName}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="ri-calendar-event-line" style={{ color: '#0ea5e9' }}></i>
                    <span>Schedule: <strong>{item.scheduledAt}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="ri-group-line" style={{ color: '#10b981' }}></i>
                    <span>{item.attendees} attendees recorded</span>
                  </div>
                </div>

                {/* Session Check-in Section for Live Classes */}
                {isLive && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ri-shield-check-line" style={{ color: '#16a34a' }}></i> Session Attendance Check-In
                    </div>

                    {isAttended ? (
                      <div style={{ color: '#16a34a', fontSize: '13px', fontWeight: 600, padding: '8px 12px', background: '#dcfce7', borderRadius: '8px' }}>
                        ✓ You are marked Present for this session!
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <input 
                            type="text" 
                            placeholder="Enter 6-char session code"
                            value={sessionCodes[item.id] || ''}
                            onChange={(e) => handleCodeChange(item.id, e.target.value)}
                            style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', textTransform: 'uppercase' }}
                          />
                          <button
                            onClick={() => handleCheckIn(item)}
                            disabled={checkingInId === item.id}
                            style={{
                              padding: '8px 16px',
                              background: '#16a34a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: checkingInId === item.id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {checkingInId === item.id ? 'Checking...' : 'Check In'}
                          </button>
                        </div>
                        {checkInMessages[item.id] && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: checkInMessages[item.id].type === 'success' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                            {checkInMessages[item.id].text}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 'auto' }}>
                  {isLive ? (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px',
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '14px',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <i className="ri-broadcast-line"></i> Join Live Session
                    </a>
                  ) : item.status === 'Upcoming' ? (
                    <button
                      onClick={() => alert(`Class reminder registered for "${item.title}". You will receive an alert when it goes live!`)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <i className="ri-notification-3-line"></i> Set Session Reminder
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#f1f5f9',
                        color: '#94a3b8',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 500,
                        fontSize: '13px',
                        cursor: 'default'
                      }}
                    >
                      Session Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
