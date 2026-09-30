import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const closeMobileSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
    }
  };

  const handleItemClick = (e, tab) => {
    e.preventDefault();
    onTabChange(tab);
    closeMobileSidebar();
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="ri-book-open-fill"></i>
          <h2>EduConnect</h2>
        </div>
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={closeMobileSidebar}
          aria-label="Close Sidebar"
        >
          <i className="ri-close-line"></i>
        </button>
      </div>

      <ul className="menu">
        <li className={activeTab === 'dashboard' ? 'active' : ''}>
          <a href="#" onClick={(e) => handleItemClick(e, 'dashboard')}>
            <i className="ri-home-5-fill"></i>
            <span>Dashboard</span>
          </a>
        </li>

        <li className={activeTab === 'students' ? 'active' : ''}>
          <a href="#students" onClick={(e) => handleItemClick(e, 'students')}>
            <i className="ri-user-3-fill"></i>
            <span>Students</span>
          </a>
        </li>

        <li className={activeTab === 'teachers' ? 'active' : ''}>
          <a href="#teachers" onClick={(e) => handleItemClick(e, 'teachers')}>
            <i className="ri-user-star-fill"></i>
            <span>Teachers</span>
          </a>
        </li>

        <li className={activeTab === 'courses' ? 'active' : ''}>
          <a href="#courses" onClick={(e) => handleItemClick(e, 'courses')}>
            <i className="ri-book-fill"></i>
            <span>Courses</span>
          </a>
        </li>

        <li className={activeTab === 'live' ? 'active' : ''}>
          <a href="#live" onClick={(e) => handleItemClick(e, 'live')}>
            <i className="ri-live-fill"></i>
            <span>Live Classes</span>
          </a>
        </li>

        <li className={activeTab === 'messages' ? 'active' : ''}>
          <a href="#messages" onClick={(e) => handleItemClick(e, 'messages')}>
            <i className="ri-message-2-fill"></i>
            <span>Messages</span>
          </a>
        </li>

        <li className={activeTab === 'reviews' ? 'active' : ''}>
          <a href="#reviews" onClick={(e) => handleItemClick(e, 'reviews')}>
            <i className="ri-star-fill"></i>
            <span>Reviews</span>
          </a>
        </li>

        <li className={activeTab === 'analytics' ? 'active' : ''}>
          <a href="#analytics" onClick={(e) => handleItemClick(e, 'analytics')}>
            <i className="ri-bar-chart-fill"></i>
            <span>Analytics</span>
          </a>
        </li>

        <li className={activeTab === 'reports' ? 'active' : ''}>
          <a href="#reports" onClick={(e) => handleItemClick(e, 'reports')}>
            <i className="ri-file-chart-fill"></i>
            <span>Reports</span>
          </a>
        </li>

        <li className={activeTab === 'settings' ? 'active' : ''}>
          <a href="#settings" onClick={(e) => handleItemClick(e, 'settings')}>
            <i className="ri-settings-3-fill"></i>
            <span>Settings</span>
          </a>
        </li>

        <li>
          <a href="#logout" onClick={handleLogout}>
            <i className="ri-logout-circle-r-fill"></i>
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}
