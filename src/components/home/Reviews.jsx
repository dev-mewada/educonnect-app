import React from 'react';

export default function Reviews() {
  const reviews = [
    {
      name: 'Pravin Sharma',
      role: 'Full Stack Engineer @ TechVentures',
      course: 'Full Stack Web Development',
      image: '/images/WIN_20250826_17_31_36_Pro.jpg',
      quote: 'EduConnect Pro transformed my learning path. The live lectures and continuous assignment feedback gave me the confidence to crack high-paying tech interviews in just 4 months!'
    },
    {
      name: 'Rohit Patel',
      role: 'Software Developer @ FinCloud',
      course: 'JavaScript & TypeScript Mastery',
      image: '/images/TE3.avif',
      quote: 'The mentor support is phenomenal. Whenever I encountered complex concurrency bugs or async promise chains, my instructor reviewed my pull request within hours.'
    },
    {
      name: 'Anjali Sharma',
      role: 'Junior Data Scientist @ AI Labs',
      course: 'Python for Data Science & ML',
      image: '/images/TE2.webp',
      quote: 'Practical capstone projects and live coding workshops make this platform miles ahead of static video platforms. Highly recommended for any serious learner!'
    }
  ];

  return (
    <section className="modern-section reviews-section" id="reviews">
      <div className="container">
        <div className="section-header-center">
          <div className="section-pill">
            <i className="ri-heart-3-fill"></i>
            STUDENT SUCCESS STORIES
          </div>
          <h2 className="section-heading">Loved By Over 10,000+ Global Learners</h2>
          <p className="section-lead">
            Discover how students, engineers, and career-switchers achieve breakthrough results with EduConnect Pro.
          </p>
        </div>

        <div className="reviews-grid-modern">
          {reviews.map((rev, idx) => (
            <div className="modern-review-card" key={idx}>
              <div className="review-quote-icon">
                <i className="ri-double-quotes-l"></i>
              </div>

              <div className="review-stars-row">
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
                <i className="ri-star-fill"></i>
              </div>

              <p className="review-quote-text">"{rev.quote}"</p>

              <div className="review-student-info">
                <img src={rev.image} alt={rev.name} className="review-student-avatar" />
                <div>
                  <h4 className="student-name">{rev.name}</h4>
                  <p className="student-role">{rev.role}</p>
                  <span className="course-pill-micro">{rev.course}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
