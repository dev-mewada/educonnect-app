import React from 'react';
import { Link } from 'react-router-dom';

export default function PopularCourses() {
  const courses = [
    {
      id: 'CRS-101',
      title: 'Full Stack Web Development Masterclass',
      category: 'Web Development',
      level: 'All Levels',
      duration: '12 Weeks',
      students: 250,
      rating: 4.9,
      reviews: 184,
      image: '/images/Full-Stake-Developer-1024x1024.png',
      instructor: 'Rahul Sharma',
      desc: 'Master React 18, Node.js, Express, MySQL, REST APIs, and production deployment with CI/CD.'
    },
    {
      id: 'CRS-102',
      title: 'Modern JavaScript & TypeScript Architecture',
      category: 'Programming',
      level: 'Intermediate',
      duration: '8 Weeks',
      students: 180,
      rating: 4.8,
      reviews: 132,
      image: '/images/js.jpg',
      instructor: 'Priya Singh',
      desc: 'Deep dive into asynchronous programming, ESNext features, functional patterns, and TypeScript.'
    },
    {
      id: 'CRS-103',
      title: 'Python for Data Science & Machine Learning',
      category: 'Data Science',
      level: 'Beginner',
      duration: '10 Weeks',
      students: 210,
      rating: 4.9,
      reviews: 195,
      image: '/images/python.webp',
      instructor: 'Aman Verma',
      desc: 'Build intelligent models, analyze real-world datasets with Pandas, NumPy, Scikit-Learn and PyTorch.'
    }
  ];

  return (
    <section className="modern-section courses-section" id="courses">
      <div className="container">
        <div className="section-header-between">
          <div>
            <div className="section-pill">
              <i className="ri-fire-fill"></i>
              CURATED CURRICULUM
            </div>
            <h2 className="section-heading">Featured Professional Courses</h2>
            <p className="section-lead">Gain actionable skills taught by experienced industry practitioners.</p>
          </div>
          <Link to="/login" className="view-all-link">
            <span>Explore All 250+ Courses</span>
            <i className="ri-arrow-right-up-line"></i>
          </Link>
        </div>

        <div className="courses-grid-modern">
          {courses.map((course) => (
            <div className="modern-course-card" key={course.id}>
              <div className="course-thumb-container">
                <img src={course.image} alt={course.title} className="course-thumb-img" />
                <span className="course-category-tag">{course.category}</span>
                <span className="course-level-tag">{course.level}</span>
              </div>

              <div className="course-card-content">
                <div className="course-meta-row">
                  <div className="course-rating">
                    <i className="ri-star-fill star-icon"></i>
                    <strong>{course.rating}</strong>
                    <span className="review-count">({course.reviews})</span>
                  </div>
                  <div className="course-duration">
                    <i className="ri-time-line"></i> {course.duration}
                  </div>
                </div>

                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-desc">{course.desc}</p>

                <div className="course-instructor-row">
                  <div className="instructor-info">
                    <div className="instructor-avatar-mini">
                      <i className="ri-user-follow-line"></i>
                    </div>
                    <span>{course.instructor}</span>
                  </div>
                  <span className="student-count-chip">
                    <i className="ri-group-line"></i> {course.students}
                  </span>
                </div>

                <div className="course-card-footer">
                  <Link to="/login" className="course-action-btn">
                    <span>View Curriculum</span>
                    <i className="ri-arrow-right-line"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
