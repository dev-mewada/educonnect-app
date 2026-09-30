import React, { useState, useEffect } from 'react';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import Topbar from '../../components/dashboard/Topbar';
import TeacherCourses from '../../components/teacher/TeacherCourses';
import TeacherLiveScheduler from '../../components/teacher/TeacherLiveScheduler';
import TeacherStudents from '../../components/teacher/TeacherStudents';
import TeacherProfile from '../../components/teacher/TeacherProfile';
import MessagesSection from '../../components/admin/MessagesSection';
import ReviewsSection from '../../components/admin/ReviewsSection';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import '../DashboardPage.css';

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  const { courses, liveClasses, reviews } = useCourses();
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    document.body.className = 'dashboard-body';
    return () => {
      document.body.className = '';
    };
  }, []);

  const loadTeacherMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const res = await api.getTeacherDashboard();
      if (res?.success && res.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Error fetching teacher dashboard metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadTeacherMetrics();
  }, []);

  const ownCourses = courses.filter(c => c.teacherId === user?.id || (user?.email === 'teacher@educonnect.com' && (c.teacherId === 2 || c.instructor?.includes('Teacher') || c.instructor?.includes('Connor') || c.instructor?.includes('Sharma'))));
  const ownLiveClasses = liveClasses.filter(lc => lc.teacherEmail === user?.email || lc.teacherName === user?.name || lc.teacher_id === user?.id);

  const totalStudents = metrics?.totalStudents ?? ownCourses.reduce((acc, c) => acc + (c.totalStudents || 0), 0);
  const totalCourses = metrics?.ownCoursesCount ?? ownCourses.length;
  const activeSessions = metrics?.upcomingLiveClasses ?? ownLiveClasses.length;
  const facultyRating = metrics?.avgRating ? `${metrics.avgRating} ★` : '4.9 ★';

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <TeacherCourses />;
      case 'live':
        return <TeacherLiveScheduler />;
      case 'students':
        return <TeacherStudents />;
      case 'messages':
        return <MessagesSection />;
      case 'reviews':
        return <ReviewsSection />;
      case 'profile':
        return <TeacherProfile />;
      case 'dashboard':
      default:
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h1 style={{ fontSize: '26px', color: '#1e293b', margin: '0 0 6px' }}>Welcome back, {user?.name || 'Professor'} 👨‍🏫</h1>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Review student engagement, manage your courses, and host live sessions from MySQL.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setActiveTab('courses')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#3b82f6',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="ri-add-line"></i> New Course
                </button>

                <button
                  onClick={() => setActiveTab('live')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="ri-broadcast-line"></i> Go Live
                </button>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="cards">
              <div className="card">
                <div className="card-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  <i className="ri-team-fill"></i>
                </div>
                <div className="card-info">
                  <h3>{loadingMetrics ? '...' : totalStudents.toLocaleString()}</h3>
                  <p>Enrolled Students</p>
                </div>
              </div>

              <div className="card">
                <div className="card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <i className="ri-book-3-fill"></i>
                </div>
                <div className="card-info">
                  <h3>{loadingMetrics ? '...' : totalCourses}</h3>
                  <p>Own Active Courses</p>
                </div>
              </div>

              <div className="card">
                <div className="card-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                  <i className="ri-live-fill"></i>
                </div>
                <div className="card-info">
                  <h3>{loadingMetrics ? '...' : activeSessions}</h3>
                  <p>Scheduled Live Classes</p>
                </div>
              </div>

              <div className="card">
                <div className="card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <i className="ri-star-fill"></i>
                </div>
                <div className="card-info">
                  <h3>{loadingMetrics ? '...' : facultyRating}</h3>
                  <p>Faculty Rating</p>
                </div>
              </div>
            </div>

            {/* Course Studio Quick Overview */}
            <div style={{ marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', color: '#1e293b', margin: 0 }}>Courses in Your Catalog</h3>
                <button 
                  onClick={() => setActiveTab('courses')}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Manage All Courses ({ownCourses.length}) →
                </button>
              </div>

              {ownCourses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {ownCourses.slice(0, 3).map(c => (
                    <div key={c.id} style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                        <img src={c.thumbnail} alt={c.title} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#1e293b' }}>{c.title}</h4>
                          <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>₹{c.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <span>{c.totalStudents} enrolled</span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: '14px', padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  You have not created any courses yet. Click "New Course" above to add one to MySQL.
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-page-root">
      <div className="dashboard">
        <TeacherSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="main-content">
          <Topbar />
          <section className="content">
            {renderContent()}
          </section>
        </main>
      </div>
    </div>
  );
}
