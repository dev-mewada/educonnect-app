import React, { useState, useEffect } from 'react';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import WhyUs from '../components/home/WhyUs';
import PopularCourses from '../components/home/PopularCourses';
import Teachers from '../components/home/Teachers';
import Reviews from '../components/home/Reviews';
import Thought from '../components/home/Thought';
import Footer from '../components/home/Footer';
import './HomePage.css';

export default function HomePage() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.body.className = isDark ? 'home-body dark' : 'home-body';

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
      setShowTopBtn(currentScroll > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      document.body.className = '';
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="home-page-root">
      {/* Dynamic Ambient Background Meshes */}
      <div className="home-ambient-background">
        <div
          className="ambient-blur-blob blob-1"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
        <div
          className="ambient-blur-blob blob-2"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        ></div>
        <div
          className="ambient-blur-blob blob-3"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
      </div>

      <Navbar />
      <Hero />
      <WhyUs />
      <PopularCourses />
      <Teachers />
      <Reviews />
      <Thought />
      <Footer />

      {/* Floating Modern Controls */}
      <div className="floating-page-controls">
        <button
          className="mode-toggle-pill"
          onClick={toggleDarkMode}
          aria-label="Toggle Theme"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <i className="ri-sun-line"></i> : <i className="ri-moon-line"></i>}
        </button>

        {showTopBtn && (
          <button
            className="scroll-top-pill"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Scroll to Top"
          >
            <i className="ri-arrow-up-line"></i>
          </button>
        )}
      </div>
    </div>
  );
}
