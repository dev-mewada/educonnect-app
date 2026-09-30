import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function ReportsSection() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getAdminDashboard()
      .then(res => {
        if (isMounted && res?.success && res.data) {
          setMetrics(res.data);
        }
      })
      .catch(err => console.error('Error loading reports metrics:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 5px' }}>System Reports & Summaries</h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>High-level institutional insights, learner completion ratios, and growth metrics from MySQL.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Total Course Enrollments</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>
            {loading ? '...' : (metrics?.totalEnrollments || 0)}
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Active learners registered across courses</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Active Live Classes</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>
            {loading ? '...' : (metrics?.activeLiveClasses || 0)}
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Interactive mentor sessions scheduled</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Published Masterclasses</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6', marginBottom: '6px' }}>
            {loading ? '...' : (metrics?.totalCourses || 0)}
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Accredited course curriculum</span>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '16px' }}>Category Enrollment Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 16px' }}>Subject Category</th>
              <th style={{ padding: '12px 16px' }}>Available Courses</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading report metrics...</td>
              </tr>
            ) : metrics?.categories && metrics.categories.length > 0 ? (
              metrics.categories.map((cat, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{cat.category}</td>
                  <td style={{ padding: '12px 16px' }}>{cat.count} Masterclass{cat.count > 1 ? 'es' : ''}</td>
                  <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 600 }}>Active</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No category metrics available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
