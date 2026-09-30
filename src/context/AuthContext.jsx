import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Restore authenticated session on startup via GET /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('educonnect_token');
      if (!token) {
        setUser(null);
        localStorage.removeItem('educonnect_user');
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res && res.success && res.user) {
          const authenticatedUser = {
            ...res.user,
            avatar: res.user.profile_photo || (
              res.user.role === 'Teacher' 
                ? '/images/TE1.jpg' 
                : res.user.role === 'Admin' 
                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                  : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
            ),
            loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          delete authenticatedUser.password;
          delete authenticatedUser.password_hash;
          setUser(authenticatedUser);
          localStorage.setItem('educonnect_user', JSON.stringify(authenticatedUser));
        } else {
          // Token invalid or expired
          setUser(null);
          localStorage.removeItem('educonnect_token');
          localStorage.removeItem('educonnect_user');
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('educonnect_token');
        localStorage.removeItem('educonnect_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('educonnect_token', token);
    }
    const authenticatedUser = {
      ...userData,
      avatar: userData.profile_photo || (
        userData.role === 'Teacher' 
          ? '/images/TE1.jpg' 
          : userData.role === 'Admin' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
      ),
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    delete authenticatedUser.password;
    delete authenticatedUser.password_hash;

    setUser(authenticatedUser);
    localStorage.setItem('educonnect_user', JSON.stringify(authenticatedUser));
    return authenticatedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('educonnect_user');
    localStorage.removeItem('educonnect_token');
    showToast('You have been logged out securely.', 'info');
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      delete updated.password;
      delete updated.password_hash;
      localStorage.setItem('educonnect_user', JSON.stringify(updated));
      return updated;
    });
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, toast, showToast }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
