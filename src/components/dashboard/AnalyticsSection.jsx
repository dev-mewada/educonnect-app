import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { api } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getAdminDashboard()
      .then(res => {
        if (isMounted && res?.success && res.data) {
          setAnalytics(res.data);
        }
      })
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const monthlyLabels = analytics?.monthlyTrends && analytics.monthlyTrends.length > 0
    ? analytics.monthlyTrends.map(t => t.month_label)
    : ['Baseline'];

  const monthlyData = analytics?.monthlyTrends && analytics.monthlyTrends.length > 0
    ? analytics.monthlyTrends.map(t => t.count)
    : [analytics?.totalEnrollments || 0];

  const chartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Course Enrollments',
        data: monthlyData,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,.15)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <div className="analytics">
      {/* Student Growth */}
      <div className="analytics-card">
        <h3>Platform Enrollment Growth</h3>
        <div className="chart-container" style={{ position: 'relative', height: '260px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
              Loading analytics from MySQL...
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Real Platform Activities & Summary */}
      <div className="analytics-card">
        <h3>Live Platform Activity</h3>
        <ul className="activity-list">
          <li>
            <i className="ri-user-line" style={{ color: '#2563eb', marginRight: '8px' }}></i>
            <strong>{analytics?.totalStudents || 0}</strong> Active Registered Students
          </li>
          <li>
            <i className="ri-award-line" style={{ color: '#16a34a', marginRight: '8px' }}></i>
            <strong>{analytics?.totalTeachers || 0}</strong> Certified Faculty Mentors
          </li>
          <li>
            <i className="ri-book-open-line" style={{ color: '#7c3aed', marginRight: '8px' }}></i>
            <strong>{analytics?.totalCourses || 0}</strong> Published Masterclasses
          </li>
          <li>
            <i className="ri-broadcast-line" style={{ color: '#dc2626', marginRight: '8px' }}></i>
            <strong>{analytics?.activeLiveClasses || 0}</strong> Active/Upcoming Live Sessions
          </li>
          <li>
            <i className="ri-mail-line" style={{ color: '#ea580c', marginRight: '8px' }}></i>
            <strong>{analytics?.totalMessages || 0}</strong> Communication Messages Logged
          </li>
        </ul>
      </div>
    </div>
  );
}
