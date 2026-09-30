import React from 'react';

export default function Teachers() {
  const mentors = [
    {
      name: 'Rahul Sharma',
      role: 'Lead Cloud Architect & Full Stack Mentor',
      experience: '12+ Years Experience (Ex-Google, Microsoft)',
      students: '4,500+ Students',
      rating: '4.95',
      image: '/images/TE1.jpg',
      badge: 'Master Instructor'
    },
    {
      name: 'Priya Singh',
      role: 'Principal Product Designer & UX Researcher',
      experience: '9+ Years Experience (Fintech & EdTech)',
      students: '3,200+ Students',
      rating: '4.92',
      image: '/images/TE2.webp',
      badge: 'Design Specialist'
    },
    {
      name: 'Aman Verma',
      role: 'Staff AI Research Engineer & ML Instructor',
      experience: '8+ Years Experience (Computer Vision & LLMs)',
      students: '3,800+ Students',
      rating: '4.98',
      image: '/images/TE3.avif',
      badge: 'AI Pioneer'
    }
  ];

  return (
    <section className="modern-section mentors-section" id="teachers">
      <div className="container">
        <div className="section-header-center">
          <div className="section-pill">
            <i className="ri-award-fill"></i>
            WORLD-CLASS FACULTY
          </div>
          <h2 className="section-heading">Learn Directly From Industry Pioneers</h2>
          <p className="section-lead">
            Our mentors are seasoned engineers, product leaders, and researchers bringing real production knowledge into your lectures.
          </p>
        </div>

        <div className="mentors-grid-modern">
          {mentors.map((mentor, idx) => (
            <div className="modern-mentor-card" key={idx}>
              <div className="mentor-avatar-container">
                <img src={mentor.image} alt={mentor.name} className="mentor-avatar-img" />
                <span className="mentor-badge-pill">{mentor.badge}</span>
              </div>

              <div className="mentor-card-body">
                <div className="mentor-rating-chip">
                  <i className="ri-star-fill"></i> {mentor.rating}
                </div>
                <h3 className="mentor-name">
                  {mentor.name} <i className="ri-checkbox-circle-fill verified-badge"></i>
                </h3>
                <p className="mentor-role">{mentor.role}</p>
                <div className="mentor-details">
                  <span><i className="ri-briefcase-line"></i> {mentor.experience}</span>
                  <span><i className="ri-group-line"></i> {mentor.students}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
