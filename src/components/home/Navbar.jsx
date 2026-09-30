import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isSticky, setIsSticky] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 30);

      const sections = document.querySelectorAll('section');
      let current = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 140;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id') || '';
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setShowMenu(false);
  };

  return (
    <header id="header" className={`modern-header ${isSticky ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-logo-icon">
            <i className="ri-graduation-cap-fill"></i>
          </div>
          <div className="brand-logo-text">
            <span>EduConnect</span>
            <span className="brand-pro-tag">PRO</span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav id="navbar" className={`nav-menu ${showMenu ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              <a
                href="#"
                className={activeSection === '' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={activeSection === 'about' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#courses"
                className={activeSection === 'courses' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Courses
              </a>
            </li>
            <li>
              <a
                href="#teachers"
                className={activeSection === 'teachers' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Mentors
              </a>
            </li>
            <li>
              <a
                href="#reviews"
                className={activeSection === 'reviews' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Reviews
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className={activeSection === 'contact' ? 'active' : ''}
                onClick={handleLinkClick}
              >
                Contact
              </a>
            </li>
          </ul>

          {/* Mobile Auth Buttons inside menu */}
          <div className="mobile-auth-row">
            <Link to="/login" className="nav-btn-secondary" onClick={handleLinkClick}>
              Sign In
            </Link>
            <Link to="/register" className="nav-btn-primary" onClick={handleLinkClick}>
              Get Started
            </Link>
          </div>
        </nav>

        {/* Right Desktop Actions */}
        <div className="nav-actions">
          <Link to="/login" className="nav-btn-secondary">
            Sign In
          </Link>
          <Link to="/register" className="nav-btn-primary">
            <span>Get Started</span>
            <i className="ri-arrow-right-line"></i>
          </Link>
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Toggle Navigation Menu"
          >
            <i className={showMenu ? 'ri-close-line' : 'ri-menu-4-line'}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
