import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toast } = useAuth();

  if (!toast) return null;

  const iconMap = {
    success: 'ri-checkbox-circle-fill',
    error: 'ri-error-warning-fill',
    info: 'ri-information-fill',
    warning: 'ri-alert-fill'
  };

  return (
    <div className={`toast-notification ${toast.type || 'info'} animate-slide-in`}>
      <i className={iconMap[toast.type] || iconMap.info}></i>
      <span className="toast-text">{toast.message}</span>
    </div>
  );
}
