import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (anchorId) => {
    setMobileMenuOpen(false);
    if (!isHome) {
      navigate('/#' + anchorId);
      return;
    }
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`header-navbar ${isSticky ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrapper">
            <i className="ri-graduation-cap-fill"></i>
          </div>
          <span className="logo-text">
            EduConnect <span className="logo-badge">Pro</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`} id="navbar">
          <ul>
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' && !location.hash ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <a 
                href="#about" 
                onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#courses" 
                onClick={(e) => { e.preventDefault(); handleNavClick('courses'); }}
              >
                Courses
              </a>
            </li>
            <li>
              <a 
                href="#teachers" 
                onClick={(e) => { e.preventDefault(); handleNavClick('teachers'); }}
              >
                Teachers
              </a>
            </li>
            <li>
              <a 
                href="#reviews" 
                onClick={(e) => { e.preventDefault(); handleNavClick('reviews'); }}
              >
                Reviews
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}
              >
                Contact
              </a>
            </li>
            {user && (
              <li className="mobile-only-item">
                <Link to="/dashboard" className="mobile-dashboard-link">
                  <i className="ri-dashboard-3-line"></i> Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Right Actions: Theme Toggle, Auth Buttons, Mobile Toggle */}
        <div className="nav-actions">
          {/* Theme Switcher Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <i className="ri-sun-fill sun-icon"></i>
            ) : (
              <i className="ri-moon-fill moon-icon"></i>
            )}
          </button>

          {/* User Auth Info */}
          {user ? (
            <div className="user-nav-profile">
              <Link to="/dashboard" className="btn-dashboard-nav">
                <i className="ri-dashboard-line"></i>
                <span>Dashboard</span>
              </Link>
              <div className="user-avatar-badge" title={`${user.name} (${user.role})`}>
                <img src={user.avatar} alt={user.name} className="nav-avatar-img" />
                <span className="role-tag-pill">{user.role}</span>
              </div>
              <button 
                type="button" 
                onClick={handleLogout} 
                className="btn-logout-icon" 
                title="Logout"
              >
                <i className="ri-logout-box-r-line"></i>
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <Link to="/login" className="btn-login-nav">
                <i className="ri-login-box-line"></i>
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn-register-nav">
                <i className="ri-user-add-line"></i>
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button 
            type="button"
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            <i className={mobileMenuOpen ? 'ri-close-line' : 'ri-menu-3-line'}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
