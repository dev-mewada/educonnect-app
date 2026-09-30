import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [studentsCount, setStudentsCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);

  useEffect(() => {
    let current1 = 0, current2 = 0, current3 = 0;
    const target1 = 10000;
    const target2 = 250;
    const target3 = 120;

    const interval = setInterval(() => {
      let completed = true;

      if (current1 < target1) {
        current1 = Math.min(current1 + Math.ceil(target1 / 60), target1);
        setStudentsCount(current1);
        completed = false;
      }

      if (current2 < target2) {
        current2 = Math.min(current2 + Math.ceil(target2 / 60), target2);
        setCoursesCount(current2);
        completed = false;
      }

      if (current3 < target3) {
        current3 = Math.min(current3 + Math.ceil(target3 / 60), target3);
        setTeachersCount(current3);
        completed = false;
      }

      if (completed) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="modern-hero" id="home">
      {/* Background ambient lighting */}
      <div className="hero-glow-mesh">
        <div className="mesh-orb orb-1"></div>
        <div className="mesh-orb orb-2"></div>
      </div>

      <div className="container hero-container">
        {/* Left Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            <span>Next-Generation Education Platform • 2026</span>
          </div>

          <h1 className="hero-title">
            Learn Smarter. <br />
            Accelerate Your Career <br />
            <span className="hero-gradient-text">With EduConnect Pro</span>
          </h1>

          <p className="hero-description">
            Experience live interactive classes, collaborate with certified mentors, build hands-on industry capstones, and unlock globally recognized credentials.
          </p>

          <div className="hero-cta-group">
            <a href="#courses" className="hero-btn-primary">
              <span>Explore Courses</span>
              <i className="ri-arrow-right-line"></i>
            </a>
            <Link to="/login" className="hero-btn-secondary">
              <i className="ri-flashlight-line"></i>
              <span>Access Demo Portal</span>
            </Link>
          </div>

          {/* Real-time stats row */}
          <div className="hero-metrics-row">
            <div className="metric-item">
              <div className="metric-number">{studentsCount.toLocaleString()}+</div>
              <div className="metric-label">Active Learners</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <div className="metric-number">{coursesCount}+</div>
              <div className="metric-label">Certified Courses</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <div className="metric-number">{teachersCount}+</div>
              <div className="metric-label">Expert Mentors</div>
            </div>
          </div>
        </div>

        {/* Right Showcase Visual */}
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <img
              src="/images/graduation-cap-with-earth-globe-concept-of-global-business-study-abroad-educational-back-to-school-education-in-global-world-study-abroad-business-in-universities-in-worldwide-language-study-photo.jpg"
              alt="EduConnect Pro Global Education"
              className="main-hero-img"
            />
            <div className="hero-image-overlay"></div>
          </div>

          {/* Floating Badge 1: Live Classroom */}
          <div className="floating-card live-card">
            <div className="live-indicator">
              <span className="live-dot"></span>
              LIVE NOW
            </div>
            <div className="live-card-body">
              <div className="live-icon">
                <i className="ri-broadcast-fill"></i>
              </div>
              <div>
                <h4>Full Stack Cloud Masterclass</h4>
                <p>142 Students Attending</p>
              </div>
            </div>
          </div>

          {/* Floating Badge 2: Verified Certificate */}
          <div className="floating-card certificate-card">
            <div className="cert-icon">
              <i className="ri-award-fill"></i>
            </div>
            <div>
              <h4>Accredited Certification</h4>
              <p>Recognized by top tech firms</p>
            </div>
          </div>

          {/* Floating Badge 3: Rating Pill */}
          <div className="floating-rating-pill">
            <div className="star-row">
              <i className="ri-star-fill"></i>
              <i className="ri-star-fill"></i>
              <i className="ri-star-fill"></i>
              <i className="ri-star-fill"></i>
              <i className="ri-star-fill"></i>
            </div>
            <span><strong>4.9 / 5</strong> Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
