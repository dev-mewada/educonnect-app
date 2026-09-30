import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import Topbar from '../../components/dashboard/Topbar';
import BrowseCourses from '../../components/student/BrowseCourses';
import MyCourses from '../../components/student/MyCourses';
import StudentLiveClasses from '../../components/student/StudentLiveClasses';
import StudentMessages from '../../components/student/StudentMessages';
import StudentReviews from '../../components/student/StudentReviews';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import '../DashboardPage.css';

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  const { enrollments, courses, liveClasses } = useCourses();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    document.body.className = 'dashboard-body';
    return () => {
      document.body.className = '';
    };
  }, []);

  const loadStudentDashboard = async () => {
    try {
      setLoadingStats(true);
      const res = await api.getStudentDashboard();
      if (res?.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Error fetching student dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  const myEnrollments = enrollments;
  const enrolledCount = dashboardData?.enrolledCount ?? myEnrollments.length;
  const avgProgress = dashboardData?.avgProgress ?? (myEnrollments.length > 0 
    ? Math.round(myEnrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / myEnrollments.length)
    : 0);
  const completedCount = dashboardData?.completedCount ?? myEnrollments.filter(e => e.progress === 100).length;
  const availableLiveCount = dashboardData?.availableLiveClasses?.length ?? liveClasses.filter(c => c.status === 'Upcoming' || c.status === 'Live').length;

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return <BrowseCourses />;
      case 'my-courses':
        return <MyCourses onBrowseClick={() => setActiveTab('browse')} />;
      case 'live':
        return <StudentLiveClasses />;
      case 'messages':
        return <StudentMessages />;
      case 'reviews':
        return <StudentReviews />;
      case 'settings':
        return (
          <div style={{ marginTop: '25px', background: '#fff', borderRadius: '16px', padding: '30px', maxWidth: '700px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '22px', color: '#1e293b', marginBottom: '8px' }}>Student Profile & Account Settings</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Manage personal details, notifications, and security settings.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Full Name</label>
                <input type="text" defaultValue={user?.name || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Email Address</label>
                <input type="email" defaultValue={user?.email || ''} disabled style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Phone Number</label>
                <input type="text" defaultValue={user?.mobile || '+91 98765 12345'} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <button 
                onClick={() => alert('Profile preferences saved.')}
                style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', marginTop: '10px' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h1 style={{ fontSize: '26px', color: '#1e293b', margin: '0 0 6px' }}>Welcome back, {user?.name || 'Student'} 🎓</h1>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Track your enrolled courses, live lecture schedules, and milestones from MySQL.</p>
              </div>

              <button
                onClick={() => setActiveTab('browse')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
                }}
              >
                <i className="ri-compass-3-line"></i> Browse New Courses
              </button>
            </div>

            {/* Overview Metric Cards */}
            <div className="cards">
              <div className="card">
                <div className="card-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  <i className="ri-book-open-fill"></i>
                </div>
                <div className="card-info">
                  <h3>{loadingStats ? '...' : enrolledCount}</h3>
                  <p>Enrolled Courses</p>
                </div>
              </div>

              <div className="card">
                <div className="card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <i className="ri-donut-chart-fill"></i>
                </div>
                <div className="card-info">
                  <h3>{loadingStats ? '...' : avgProgress}%</h3>
                  <p>Average Progress</p>
                </div>
              </div>

              <div className="card">
                <div className="card-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                  <i className="ri-live-fill"></i>
                </div>
                <div className="card-info">
                  <h3>{loadingStats ? '...' : availableLiveCount}</h3>
                  <p>Available Live Classes</p>
                </div>
              </div>

              <div className="card">
                <div className="card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <i className="ri-award-fill"></i>
                </div>
                <div className="card-info">
                  <h3>{loadingStats ? '...' : completedCount}</h3>
                  <p>Completed Courses</p>
                </div>
              </div>
            </div>

            {/* In-Progress Quick Section */}
            <div style={{ marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', color: '#1e293b', margin: 0 }}>Current Active Course Progress</h3>
                <button 
                  onClick={() => setActiveTab('my-courses')}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  View All ({myEnrollments.length}) →
                </button>
              </div>

              {myEnrollments.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {myEnrollments.slice(0, 2).map(enr => {
                    const course = courses.find(c => c.id === enr.courseId) || enr;

                    return (
                      <div key={enr.id} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '14px' }}>
                          <img src={course.thumbnail || course.image || 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=600&q=80'} alt={course.title} style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#1e293b' }}>{course.title}</h4>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{course.instructor || course.instructorName || 'Instructor'}</span>
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                            <span style={{ color: '#64748b' }}>Completion</span>
                            <span style={{ fontWeight: 600, color: '#3b82f6' }}>{enr.progress}%</span>
                          </div>
                          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${enr.progress}%`, height: '100%', background: '#3b82f6' }}></div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setActiveTab('my-courses')}
                          style={{ width: '100%', padding: '8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Continue Learning
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: '14px', padding: '30px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: '0 0 10px', color: '#64748b' }}>You are not enrolled in any courses yet.</p>
                  <button 
                    onClick={() => setActiveTab('browse')}
                    style={{ padding: '8px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Explore Course Catalog
                  </button>
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
        <StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} />

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
