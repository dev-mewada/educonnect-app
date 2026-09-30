import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TeacherSidebar({ activeTab, onTabChange }) {
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
            <i className="ri-dashboard-fill"></i>
            <span>Instructor Studio</span>
          </a>
        </li>

        <li className={activeTab === 'courses' ? 'active' : ''}>
          <a href="#courses" onClick={(e) => handleItemClick(e, 'courses')}>
            <i className="ri-book-3-fill"></i>
            <span>My Courses</span>
          </a>
        </li>

        <li className={activeTab === 'live' ? 'active' : ''}>
          <a href="#live" onClick={(e) => handleItemClick(e, 'live')}>
            <i className="ri-live-fill"></i>
            <span>Live Sessions</span>
          </a>
        </li>

        <li className={activeTab === 'students' ? 'active' : ''}>
          <a href="#students" onClick={(e) => handleItemClick(e, 'students')}>
            <i className="ri-group-fill"></i>
            <span>Enrolled Students</span>
          </a>
        </li>

        <li className={activeTab === 'messages' ? 'active' : ''}>
          <a href="#messages" onClick={(e) => handleItemClick(e, 'messages')}>
            <i className="ri-chat-voice-fill"></i>
            <span>Student Inquiries</span>
          </a>
        </li>

        <li className={activeTab === 'reviews' ? 'active' : ''}>
          <a href="#reviews" onClick={(e) => handleItemClick(e, 'reviews')}>
            <i className="ri-star-smile-fill"></i>
            <span>Reviews & Ratings</span>
          </a>
        </li>

        <li className={activeTab === 'profile' ? 'active' : ''}>
          <a href="#profile" onClick={(e) => handleItemClick(e, 'profile')}>
            <i className="ri-user-star-fill"></i>
            <span>Faculty Profile</span>
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
