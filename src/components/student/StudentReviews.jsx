import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';

export default function StudentReviews() {
  const { courses, enrollments, reviews, addReview } = useCourses();
  const { user } = useAuth();

  const enrolledCourses = courses.filter(c => enrollments.some(e => e.courseId === c.id || e.courseId === Number(c.id)));

  const [selectedCourseId, setSelectedCourseId] = useState(enrolledCourses[0]?.id || (courses[0]?.id || ''));
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !selectedCourseId) return;

    try {
      setSubmitting(true);
      setErrorMsg('');

      await addReview({
        courseId: parseInt(selectedCourseId, 10),
        rating: Number(rating),
        comment: comment.trim()
      });

      setComment('');
      setSubmittedMsg(true);
      setTimeout(() => setSubmittedMsg(false), 3500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 6px' }}>Course Reviews & Feedback ⭐</h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Share your honest learning experience and help fellow students choose the best paths in MySQL.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
        {/* Form to submit review */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '18px', color: '#1e293b', margin: '0 0 16px' }}>Submit a Course Review</h3>

          {submittedMsg && (
            <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ri-checkbox-circle-fill"></i> Thank you! Your review has been submitted to MySQL.
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ri-error-warning-line"></i> {errorMsg}
            </div>
          )}

          {enrolledCourses.length === 0 ? (
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', color: '#64748b', fontSize: '14px' }}>
              You must be enrolled in at least one course to write a verified student review.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Select Enrolled Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  {enrolledCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Your Rating
                </label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '24px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <i
                      key={star}
                      onClick={() => setRating(star)}
                      className={star <= rating ? 'ri-star-fill' : 'ri-star-line'}
                      style={{ color: star <= rating ? '#f59e0b' : '#cbd5e1' }}
                    ></i>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Review & Feedback
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience with the assignments, mentors, and projects..."
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Submitting to Database...' : 'Submit Verified Review'}
              </button>
            </form>
          )}
        </div>

        {/* Existing Reviews List */}
        <div>
          <h3 style={{ fontSize: '18px', color: '#1e293b', margin: '0 0 16px' }}>Community Course Reviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.length === 0 ? (
              <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', color: '#64748b' }}>No reviews yet.</div>
            ) : (
              reviews.map(r => (
                <div key={r.id} style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#3b82f6' }}>{r.courseTitle}</span>
                    <div style={{ color: '#f59e0b', fontSize: '13px' }}>
                      {[...Array(r.rating)].map((_, i) => (
                        <i key={i} className="ri-star-fill"></i>
                      ))}
                    </div>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                    "{r.comment}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                    <span>By {r.studentName}</span>
                    <span>{r.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
