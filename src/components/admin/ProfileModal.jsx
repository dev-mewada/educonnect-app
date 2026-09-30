import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function ProfileModal({ isOpen, onClose, initialTab = 'profile' }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [dob, setDob] = useState(user?.dob ? user.dob.split('T')[0] : '');

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile({ name, mobile, dob });
      if (res && res.success) {
        if (res.user) updateUser(res.user);
        setStatusMsg({ type: 'success', text: 'Profile updated in database successfully!' });
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Failed to update profile' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Server error updating profile' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setStatusMsg({ type: 'error', text: 'Please enter current password' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: res.message || 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setStatusMsg(null);
          onClose();
        }, 1500);
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Failed to update password' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server connection error' });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '520px',
          maxWidth: '92%',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '22px 28px',
          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className={activeTab === 'profile' ? 'ri-user-3-fill' : 'ri-lock-password-fill'} style={{ fontSize: '24px' }}></i>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              {activeTab === 'profile' ? 'My Profile' : 'Change Password'}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ color: '#ffffff', fontSize: '24px', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setStatusMsg(null); }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: activeTab === 'profile' ? '#ffffff' : 'transparent',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'profile' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'profile' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            <i className="ri-user-settings-line" style={{ marginRight: '6px' }}></i>
            Profile Details
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setStatusMsg(null); }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: activeTab === 'password' ? '#ffffff' : 'transparent',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'password' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'password' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            <i className="ri-lock-line" style={{ marginRight: '6px' }}></i>
            Security & Password
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div style={{
            margin: '16px 28px 0',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            background: statusMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusMsg.type === 'success' ? '#16a34a' : '#dc2626'
          }}>
            {statusMsg.text}
          </div>
        )}

        {/* Form Body */}
        <div style={{ padding: '24px 28px' }}>
          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <img 
                  src={user?.avatar || 'https://i.pravatar.cc/70'} 
                  alt={user?.name || 'User'} 
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' }}
                />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '17px', color: '#1e293b' }}>{user?.name || 'Admin User'}</h4>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '3px 10px', 
                    borderRadius: '20px', 
                    background: '#dbeafe', 
                    color: '#2563eb', 
                    fontSize: '12px', 
                    fontWeight: 600 
                  }}>
                    {user?.role || 'Admin'}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Mobile</label>
                  <input 
                    type="text" 
                    value={mobile} 
                    onChange={(e) => setMobile(e.target.value)} 
                    style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Date of Birth</label>
                  <input 
                    type="date" 
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                    style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(37, 99, 235, 0.3)'
                }}
              >
                Save Changes
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  placeholder="Enter current password"
                  style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="At least 6 characters"
                  style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm new password"
                  style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(37, 99, 235, 0.3)'
                }}
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
