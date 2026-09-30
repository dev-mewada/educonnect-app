import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const { showToast } = useAuth();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email for the newsletter.', 'error');
      return;
    }
    showToast('🎉 Thank you for subscribing to EduConnect Pro updates!', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-container">
        {/* Col 1: Brand & Mission */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <i className="ri-graduation-cap-fill"></i>
            <span>EduConnect <strong>Pro</strong></span>
          </div>
          <p className="footer-desc">
            Empowering modern learners and instructors worldwide through interactive live classes, 
            mentorship, verified certifications, and career accelerator tracks.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="ri-facebook-fill"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="ri-instagram-line"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="ri-linkedin-fill"></i>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <i className="ri-youtube-fill"></i>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <i className="ri-github-fill"></i>
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="footer-col">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-menu">
            <li><Link to="/">Home Overview</Link></li>
            <li><a href="/#about">Why EduConnect</a></li>
            <li><a href="/#courses">Browse Courses</a></li>
            <li><a href="/#teachers">Expert Mentors</a></li>
            <li><a href="/#reviews">Student Reviews</a></li>
            <li><Link to="/login">Student / Teacher Login</Link></li>
          </ul>
        </div>

        {/* Col 3: Programs & Skills */}
        <div className="footer-col">
          <h3 className="footer-title">Popular Programs</h3>
          <ul className="footer-menu">
            <li><a href="/#courses">Full Stack Web Development</a></li>
            <li><a href="/#courses">Modern JavaScript Mastery</a></li>
            <li><a href="/#courses">Python for Beginners & AI</a></li>
            <li><a href="/#courses">UI/UX Design Masterclass</a></li>
            <li><a href="/#courses">Data Science & Analytics</a></li>
            <li><a href="/#courses">Cloud & DevOps Foundations</a></li>
          </ul>
        </div>

        {/* Col 4: Newsletter & Contact */}
        <div className="footer-col">
          <h3 className="footer-title">Stay Connected</h3>
          <p className="newsletter-info">
            Subscribe for free tutorials, workshop invites, and scholarship opportunities.
          </p>
          <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
            <div className="newsletter-input-wrapper">
              <i className="ri-mail-line"></i>
              <input
                type="email"
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="newsletter-btn">
              Subscribe <i className="ri-send-plane-fill"></i>
            </button>
          </form>
          <div className="footer-contact-details">
            <p><i className="ri-mail-check-line"></i> support@educonnect.com</p>
            <p><i className="ri-phone-line"></i> +91 98765 43210</p>
            <p><i className="ri-map-pin-2-line"></i> Tech Innovation Hub, Bengaluru, India</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-flex">
          <p>© {new Date().getFullYear()} EduConnect Pro. All Rights Reserved.</p>
          <div className="legal-links">
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#terms">Terms of Service</a>
            <span>•</span>
            <a href="#security">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
