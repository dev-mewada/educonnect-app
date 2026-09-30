import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ProfileModal from '../admin/ProfileModal';
import RegistrationDetailsModal from '../admin/RegistrationDetailsModal';

import { playNotificationSound, initAudioUnlock } from '../../utils/audio';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');

  // Real backend notifications & registration modal state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      if (res && res.success) {
        const notifs = res.data || [];
        setNotifications(notifs);
        setUnreadCount(res.unreadCount || 0);

        // Play sound for new unread notifications (tracked by ID so it only plays once)
        const unreadItems = notifs.filter((n) => !n.is_read);
        if (unreadItems.length > 0) {
          unreadItems.forEach((n) => {
            playNotificationSound(`user_notif_${n.id}`);
          });
        }
      }
    } catch {
      // Non-blocking error handling
    }
  };

  useEffect(() => {
    initAudioUnlock();
    if (user) {
      fetchNotifications();
      // Polling every 5s to keep unread badge and sound live
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotificationMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const markAllAsRead = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        await api.markAllNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      } catch {
        // Fallback
      }
    }
  };

  const handleViewDetails = (applicantId) => {
    setSelectedApplicantId(applicantId);
    setRegistrationModalOpen(true);
    setShowNotificationMenu(false);
  };

  const toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="left">
          <button
            type="button"
            className="sidebar-mobile-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Menu"
          >
            <i className="ri-menu-2-line"></i>
          </button>
          <h2>Dashboard</h2>
        </div>

        <div className="right">
          <div className="search-box">
            <i className="ri-search-line"></i>
            <input type="text" placeholder="Search..." />
          </div>

          {/* Notification Bell */}
          <div
            ref={notifRef}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <div
              className="notification"
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            >
              <i className="ri-notification-3-fill"></i>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </div>

            <div className={`notification-menu ${showNotificationMenu ? 'active' : ''}`} style={{ minWidth: '340px' }}>
              <div className="notification-header">
                <h3>Notifications</h3>
                <span>{unreadCount > 0 ? `${unreadCount} New` : 'All read'}</span>
              </div>

              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    <i className="ri-notification-off-line" style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}></i>
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="notification-item"
                      style={{
                        opacity: notif.is_read ? 0.65 : 1,
                        padding: '10px 8px',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <i
                        className={
                          notif.applicant_role === 'Teacher'
                            ? 'ri-user-star-fill'
                            : notif.applicant_role === 'Student'
                            ? 'ri-user-add-fill'
                            : 'ri-notification-3-line'
                        }
                        style={{ color: '#4f46e5', fontSize: '1.25rem', marginTop: '2px' }}
                      ></i>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '13px' }}>{notif.title}</strong>
                          {!notif.is_read && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
                          )}
                        </div>
                        <p style={{ margin: '3px 0 6px', fontSize: '12px' }}>{notif.message}</p>
                        {notif.applicant_id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(notif.applicant_id);
                            }}
                            style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#2563eb',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="ri-eye-line"></i> View Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="notification-footer">
                  <a href="#markRead" onClick={markAllAsRead}>
                    {unreadCount > 0 ? 'Mark All As Read' : 'All Caught Up!'}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Profile */}
          <div
            ref={profileRef}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <div
              className="profile"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <img
                src={user?.avatar || 'https://i.pravatar.cc/45'}
                alt={user?.name || 'Admin'}
              />
              <span>{user?.name || 'Admin'}</span>
              <i className="ri-arrow-down-s-line"></i>
            </div>

            <div className={`profile-menu ${showProfileMenu ? 'active' : ''}`}>
              <a
                href="#profile"
                onClick={(e) => {
                  e.preventDefault();
                  setProfileModalTab('profile');
                  setProfileModalOpen(true);
                  setShowProfileMenu(false);
                }}
              >
                <i className="ri-user-3-line"></i>
                My Profile
              </a>

              <a
                href="#password"
                onClick={(e) => {
                  e.preventDefault();
                  setProfileModalTab('password');
                  setProfileModalOpen(true);
                  setShowProfileMenu(false);
                }}
              >
                <i className="ri-lock-password-line"></i>
                Change Password
              </a>

              <a href="#logout" onClick={handleLogout}>
                <i className="ri-logout-box-r-line"></i>
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Password Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialTab={profileModalTab}
      />

      {/* Registration Details & Approval Modal */}
      <RegistrationDetailsModal
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        applicantId={selectedApplicantId}
        onActionSuccess={fetchNotifications}
      />
    </>
  );
}
