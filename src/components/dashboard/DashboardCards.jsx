import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function DashboardCards() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    activeLiveClasses: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getAdminDashboard()
      .then(res => {
        if (isMounted && res?.success && res.data) {
          setMetrics(res.data);
        }
      })
      .catch(err => console.error('Failed to load dashboard metrics:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="cards">
      <div className="card">
        <i className="ri-user-3-fill"></i>
        <h2>{loading ? '...' : metrics.totalStudents}</h2>
        <p>Total Students</p>
      </div>

      <div className="card">
        <i className="ri-user-star-fill"></i>
        <h2>{loading ? '...' : metrics.totalTeachers}</h2>
        <p>Total Teachers</p>
      </div>

      <div className="card">
        <i className="ri-book-fill"></i>
        <h2>{loading ? '...' : metrics.totalCourses}</h2>
        <p>Total Courses</p>
      </div>

      <div className="card">
        <i className="ri-live-fill"></i>
        <h2>{loading ? '...' : metrics.activeLiveClasses}</h2>
        <p>Active Live Classes</p>
      </div>
    </div>
  );
}
