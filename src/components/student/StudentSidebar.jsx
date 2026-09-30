import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function StudentSidebar({ activeTab, onTabChange }) {
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
            <i className="ri-dashboard-3-fill"></i>
            <span>My Learning</span>
          </a>
        </li>

        <li className={activeTab === 'browse' ? 'active' : ''}>
          <a href="#browse" onClick={(e) => handleItemClick(e, 'browse')}>
            <i className="ri-compass-3-fill"></i>
            <span>Browse Courses</span>
          </a>
        </li>

        <li className={activeTab === 'my-courses' ? 'active' : ''}>
          <a href="#my-courses" onClick={(e) => handleItemClick(e, 'my-courses')}>
            <i className="ri-book-read-fill"></i>
            <span>Enrolled Courses</span>
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
            <span>Mentor Q&A</span>
          </a>
        </li>

        <li className={activeTab === 'reviews' ? 'active' : ''}>
          <a href="#reviews" onClick={(e) => handleItemClick(e, 'reviews')}>
            <i className="ri-star-fill"></i>
            <span>Course Reviews</span>
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
