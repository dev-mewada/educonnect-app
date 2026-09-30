import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import DashboardCards from '../components/dashboard/DashboardCards';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import StudentManagement from '../components/admin/StudentManagement';
import TeacherManagement from '../components/admin/TeacherManagement';
import CourseManagement from '../components/admin/CourseManagement';
import LiveClassesSection from '../components/admin/LiveClassesSection';
import MessagesSection from '../components/admin/MessagesSection';
import ReviewsSection from '../components/admin/ReviewsSection';
import ReportsSection from '../components/admin/ReportsSection';
import './DashboardPage.css';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    document.body.className = 'dashboard-body';
    return () => {
      document.body.className = '';
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'live':
        return <LiveClassesSection />;
      case 'messages':
        return <MessagesSection />;
      case 'reviews':
        return <ReviewsSection />;
      case 'analytics':
        return (
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '22px', color: '#1e293b', marginBottom: '8px' }}>Platform Analytics & Metrics</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Track comprehensive engagement, student enrollments, and platform growth over time.</p>
            <DashboardCards />
            <AnalyticsSection />
          </div>
        );
      case 'reports':
        return <ReportsSection />;
      case 'settings':
        return (
          <div style={{ marginTop: '25px', background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '22px', color: '#1e293b', marginBottom: '8px' }}>System Settings & Platform Preferences</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Configure system variables, email notification preferences, and platform security rules.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="ri-notification-3-line" style={{ color: '#4f46e5' }}></i> Email Notifications
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 15px' }}>Receive automatic alerts when new teachers register or courses are submitted.</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Enable Admin Notifications
                </label>
              </div>

              <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="ri-shield-keyhole-line" style={{ color: '#059669' }}></i> Security & Authentication
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 15px' }}>Enforce strict password requirements and multi-factor validation.</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Require 2FA for Instructors
                </label>
              </div>
            </div>

            <button 
              onClick={() => alert('Settings preferences saved successfully.')}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Save Preferences
            </button>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <>
            <h1>Welcome to EduConnect Pro 👋</h1>
            <p>
              Manage Students, Teachers, Courses, Live Classes and Reports from one place.
            </p>
            <DashboardCards />
            <AnalyticsSection />
          </>
        );
    }
  };

  return (
    <div className="dashboard-page-root">
      <div className="dashboard">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

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

