import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getReviews();
      if (res?.success && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 5px' }}>Course Reviews & Feedback</h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Inspect real student ratings, feedback scores, and moderation flags directly from MySQL.</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading reviews from database...</div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px' }}>
          No student reviews submitted yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {reviews.map(rev => (
            <div key={rev.id} style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', color: '#f59e0b', fontSize: '16px', gap: '2px' }}>
                  {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                    <i key={i} className="ri-star-fill"></i>
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px', fontStyle: 'italic' }}>
                "{rev.comment || rev.review}"
              </p>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#1e293b', fontSize: '14px', display: 'block' }}>{rev.student_name || 'Enrolled Student'}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{rev.course_title || 'Course'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
