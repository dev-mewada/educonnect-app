import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function RegistrationDetailsModal({ isOpen, onClose, applicantId, onActionSuccess }) {
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // 'reject' | 'delete' | null

  useEffect(() => {
    if (isOpen && applicantId) {
      fetchApplicantDetails();
    } else {
      setApplicant(null);
      setStatusMsg(null);
      setConfirmDialog(null);
    }
  }, [isOpen, applicantId]);

  const fetchApplicantDetails = async () => {
    setLoading(true);
    setStatusMsg(null);
    setConfirmDialog(null);
    try {
      const res = await api.getRegistrationDetails(applicantId);
      setLoading(false);
      if (res && res.success && res.applicant) {
        setApplicant(res.applicant);
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Failed to load applicant details' });
      }
    } catch (err) {
      setLoading(false);
      setStatusMsg({ type: 'error', text: 'Server error while fetching applicant details' });
    }
  };

  if (!isOpen) return null;

  const handleApprove = async () => {
    setActionLoading(true);
    setStatusMsg(null);
    try {
      const res = await api.approveRegistration(applicantId);
      setActionLoading(false);
      if (res && res.success) {
        setStatusMsg({
          type: 'success',
          text: 'Registration approved! 6-digit verification code has been dispatched to applicant email.'
        });
        if (onActionSuccess) onActionSuccess();
        setTimeout(() => {
          fetchApplicantDetails();
        }, 1200);
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Approval failed' });
      }
    } catch (err) {
      setActionLoading(false);
      setStatusMsg({ type: 'error', text: 'Failed to communicate with server' });
    }
  };

  const handleRejectConfirm = async () => {
    setActionLoading(true);
    setStatusMsg(null);
    setConfirmDialog(null);
    try {
      const res = await api.rejectRegistration(applicantId);
      setActionLoading(false);
      if (res && res.success) {
        setStatusMsg({ type: 'info', text: 'Registration has been rejected.' });
        if (onActionSuccess) onActionSuccess();
        setTimeout(() => {
          fetchApplicantDetails();
        }, 1000);
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Rejection failed' });
      }
    } catch (err) {
      setActionLoading(false);
      setStatusMsg({ type: 'error', text: 'Failed to communicate with server' });
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setStatusMsg(null);
    setConfirmDialog(null);
    try {
      const res = await api.deletePendingRegistration(applicantId);
      setActionLoading(false);
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: 'Pending registration permanently deleted.' });
        if (onActionSuccess) onActionSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Delete failed' });
      }
    } catch (err) {
      setActionLoading(false);
      setStatusMsg({ type: 'error', text: 'Failed to communicate with server' });
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
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
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '560px',
          maxWidth: '92%',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="ri-user-search-fill" style={{ fontSize: '24px' }}></i>
            <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 600 }}>
              {applicant?.role || 'User'} Registration Details
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              color: '#ffffff',
              fontSize: '24px',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            style={{
              margin: '16px 24px 0',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              background:
                statusMsg.type === 'success'
                  ? '#dcfce7'
                  : statusMsg.type === 'info'
                  ? '#e0e7ff'
                  : '#fee2e2',
              color:
                statusMsg.type === 'success'
                  ? '#16a34a'
                  : statusMsg.type === 'info'
                  ? '#4338ca'
                  : '#dc2626'
            }}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Confirmation Modal Overlays */}
        {confirmDialog === 'reject' && (
          <div
            style={{
              margin: '16px 24px',
              padding: '16px',
              borderRadius: '12px',
              background: '#fff1f2',
              border: '1px solid #fecdd3'
            }}
          >
            <p style={{ margin: '0 0 12px', color: '#9f1239', fontWeight: 600, fontSize: '14px' }}>
              Are you sure you want to reject this registration?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={actionLoading}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#e11d48',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        )}

        {confirmDialog === 'delete' && (
          <div
            style={{
              margin: '16px 24px',
              padding: '16px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca'
            }}
          >
            <p style={{ margin: '0 0 12px', color: '#991b1b', fontWeight: 600, fontSize: '14px' }}>
              Are you sure you want to delete this registration?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              <i className="ri-loader-4-line spin-icon" style={{ fontSize: '28px', color: '#2563eb' }}></i>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>Loading registration details...</p>
            </div>
          ) : applicant ? (
            <div>
              {/* Top Summary Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  marginBottom: '18px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '16px', color: '#0f172a' }}>
                    {applicant.name}
                  </h4>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{applicant.email}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      background: applicant.role === 'Teacher' ? '#f3e8ff' : '#dbeafe',
                      color: applicant.role === 'Teacher' ? '#7e22ce' : '#1d4ed8',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    {applicant.role}
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      background:
                        applicant.status === 'Active'
                          ? '#dcfce7'
                          : applicant.status === 'Approved'
                          ? '#fef3c7'
                          : applicant.status === 'Rejected'
                          ? '#fee2e2'
                          : '#e0e7ff',
                      color:
                        applicant.status === 'Active'
                          ? '#15803d'
                          : applicant.status === 'Approved'
                          ? '#b45309'
                          : applicant.status === 'Rejected'
                          ? '#b91c1c'
                          : '#4338ca',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    {applicant.status === 'Pending' ? 'Pending Approval' : applicant.status}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '13px',
                  marginBottom: '18px'
                }}
              >
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                    Full Name
                  </strong>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.name}</span>
                </div>

                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                    Email Address
                  </strong>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.email}</span>
                </div>

                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                    Mobile Number
                  </strong>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.mobile || 'Not specified'}</span>
                </div>

                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                    Date of Birth
                  </strong>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.dob || 'Not specified'}</span>
                </div>

                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                    Registered On
                  </strong>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>
                    {applicant.created_at ? new Date(applicant.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>

                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <strong style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                    Verification Status
                  </strong>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>
                    {applicant.is_verified ? 'Email Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              {/* Teacher-Specific Fields */}
              {applicant.role === 'Teacher' && applicant.details && (
                <div
                  style={{
                    padding: '14px',
                    background: '#faf5ff',
                    borderRadius: '12px',
                    border: '1px solid #f3e8ff',
                    marginBottom: '18px'
                  }}
                >
                  <h5 style={{ margin: '0 0 10px', fontSize: '13px', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>
                    Teacher Professional Details
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: '#7e22ce', display: 'block', fontSize: '11px' }}>Subject Specialization</strong>
                      <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.details.subject || 'N/A'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#7e22ce', display: 'block', fontSize: '11px' }}>Teaching Experience</strong>
                      <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.details.experience || 'N/A'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#7e22ce', display: 'block', fontSize: '11px' }}>Highest Qualification</strong>
                      <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.details.qualification || 'N/A'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#7e22ce', display: 'block', fontSize: '11px' }}>Resume / Portfolio</strong>
                      <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.details.resume || 'Provided on File'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Student-Specific Fields */}
              {applicant.role === 'Student' && applicant.details && (
                <div
                  style={{
                    padding: '14px',
                    background: '#f0fdf4',
                    borderRadius: '12px',
                    border: '1px solid #dcfce7',
                    marginBottom: '18px'
                  }}
                >
                  <h5 style={{ margin: '0 0 10px', fontSize: '13px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                    Student Academic Information
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: '#15803d', display: 'block', fontSize: '11px' }}>Grade / Level</strong>
                      <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.details.grade_level || 'General'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#15803d', display: 'block', fontSize: '11px' }}>Learning Interests</strong>
                      <span style={{ color: '#1e293b', fontWeight: 600 }}>{applicant.details.interests || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons for Pending / Approval */}
              {applicant.status !== 'Active' && !confirmDialog && (
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                    paddingTop: '12px',
                    borderTop: '1px solid #e2e8f0'
                  }}
                >
                  {applicant.status !== 'Approved' && (
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={actionLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <i className="ri-check-line"></i>
                      {actionLoading ? 'Approving...' : 'Approve'}
                    </button>
                  )}

                  {applicant.status !== 'Rejected' && (
                    <button
                      type="button"
                      onClick={() => setConfirmDialog('reject')}
                      disabled={actionLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: '1px solid #fecdd3',
                        background: '#fff1f2',
                        color: '#e11d48',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="ri-close-circle-line"></i>
                      Reject
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setConfirmDialog('delete')}
                    disabled={actionLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="ri-delete-bin-line"></i>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
              No applicant details available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
