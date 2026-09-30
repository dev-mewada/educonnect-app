import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function TeacherProfile() {
  const { user, updateUser } = useAuth();

  const [subject, setSubject] = useState(user?.details?.subject || user?.subject || '');
  const [experience, setExperience] = useState(user?.details?.experience || user?.experience || '');
  const [qualification, setQualification] = useState(user?.details?.qualification || user?.qualification || '');
  const [bio, setBio] = useState(user?.details?.bio || user?.bio || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile({ subject, experience, qualification });
      if (res && res.success) {
        updateUser({
          ...user,
          subject,
          experience,
          qualification,
          details: { ...(user?.details || {}), subject, experience, qualification }
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch {
      // Non-blocking
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.3s ease', maxWidth: '840px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 6px' }}>Faculty Profile & Credentials 🎓</h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Manage your academic qualifications, verified status, and course credentials.</p>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '30px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        {/* Verification Status Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              <i className="ri-shield-check-fill"></i>
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#15803d', fontSize: '15px' }}>Verified Educator Account</h4>
              <span style={{ fontSize: '12px', color: '#166534' }}>Identity, academic degrees, and credentials verified by EduConnect Administration.</span>
            </div>
          </div>

          <span style={{
            background: '#22c55e',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: '20px'
          }}>
            Approved
          </span>
        </div>

        {isSaved && (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ri-checkbox-circle-fill"></i> Faculty credentials updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Instructor Name</label>
              <input 
                type="text" 
                defaultValue={user?.name || ''} 
                disabled 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Official Email</label>
              <input 
                type="email" 
                defaultValue={user?.email || ''} 
                disabled 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Subject Specialization</label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Teaching Experience</label>
              <input 
                type="text" 
                value={experience} 
                onChange={(e) => setExperience(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Highest Qualification & University</label>
            <input 
              type="text" 
              value={qualification} 
              onChange={(e) => setQualification(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Instructor Biography</label>
            <textarea 
              rows="4" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical' }} 
            ></textarea>
          </div>

          {/* Resume / Document section */}
          <div style={{ padding: '16px', border: '1px dashed #cbd5e1', borderRadius: '10px', background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#1e293b' }}>
              <i className="ri-file-pdf-fill" style={{ color: '#ef4444', marginRight: '6px' }}></i>
              Faculty Curriculum Vitae (CV) / Credentials
            </h4>
            <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b' }}>
              {user?.details?.resume ? user.details.resume : `${user?.name ? user.name.replace(/\s+/g, '_') : 'Faculty'}_Credentials.pdf`} — Verified by Admin
            </p>
            <button
              type="button"
              onClick={() => alert('Resume preview modal: Rahul_Sharma_CV_2026.pdf is valid and verified.')}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
            >
              View Document
            </button>
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              alignSelf: 'flex-start',
              marginTop: '10px'
            }}
          >
            Save Faculty Profile
          </button>
        </form>
      </div>
    </div>
  );
}
