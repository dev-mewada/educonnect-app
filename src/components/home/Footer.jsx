import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setNewsletterEmail('');
      }, 3500);
    }
  };

  return (
    <footer id="contact" className="modern-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Col 1: Brand & Mission */}
          <div className="footer-col brand-col">
            <Link to="/" className="brand-logo footer-logo">
              <div className="brand-logo-icon">
                <i className="ri-graduation-cap-fill"></i>
              </div>
              <div className="brand-logo-text">
                <span>EduConnect</span>
                <span className="brand-pro-tag">PRO</span>
              </div>
            </Link>
            <p className="footer-description">
              Empowering global learners through live interactive classrooms, accredited certifications, industry-tailored curriculums, and direct mentor coaching.
            </p>
            <div className="social-pills-row">
              <a href="#github" aria-label="GitHub" className="social-pill">
                <i className="ri-github-fill"></i>
              </a>
              <a href="#linkedin" aria-label="LinkedIn" className="social-pill">
                <i className="ri-linkedin-fill"></i>
              </a>
              <a href="#twitter" aria-label="Twitter" className="social-pill">
                <i className="ri-twitter-x-line"></i>
              </a>
              <a href="#youtube" aria-label="YouTube" className="social-pill">
                <i className="ri-youtube-fill"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links-list">
              <li><a href="#about">Features & Tools</a></li>
              <li><a href="#courses">Featured Courses</a></li>
              <li><a href="#teachers">Expert Mentors</a></li>
              <li><a href="#reviews">Student Outcomes</a></li>
              <li><Link to="/login">Demo Accounts</Link></li>
            </ul>
          </div>

          {/* Col 3: Support & Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact & Support</h4>
            <ul className="footer-contact-list">
              <li>
                <i className="ri-mail-send-line"></i>
                <span>support@educonnect.com</span>
              </li>
              <li>
                <i className="ri-phone-line"></i>
                <span>+91 98765 43210</span>
              </li>
              <li>
                <i className="ri-map-pin-2-line"></i>
                <span>Tech Campus, Bengaluru, India</span>
              </li>
              <li>
                <i className="ri-customer-service-2-line"></i>
                <span>24/7 Academic Helpdesk</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-col-title">Stay Updated</h4>
            <p className="newsletter-desc">
              Subscribe to receive weekly insights, free workshops, and early batch notifications.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="newsletter-input-box">
                <i className="ri-mail-line"></i>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="newsletter-submit-btn">
                {subscribed ? 'Subscribed! ✓' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © 2026 <strong>EduConnect Pro</strong>. All Rights Reserved. Built for modern academic excellence.
          </p>
          <div className="footer-legal-links">
            <a href="#privacy">Privacy Policy</a>
            <span className="dot-sep">•</span>
            <a href="#terms">Terms of Service</a>
            <span className="dot-sep">•</span>
            <a href="#cookies">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
