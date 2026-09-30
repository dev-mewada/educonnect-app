import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const thoughts = [
  "Success is the sum of small efforts repeated day in and day out.",
  "Discipline consistently outperforms temporary motivation.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Dream big, build small everyday milestones, and execute relentlessly.",
  "Your future is constructed by the code you write and the skills you hone today."
];

export default function Thought() {
  const [dailyThought, setDailyThought] = useState('');

  useEffect(() => {
    const random = Math.floor(Math.random() * thoughts.length);
    setDailyThought(thoughts[random]);
  }, []);

  return (
    <section className="modern-section thought-cta-section">
      <div className="container">
        <div className="thought-cta-card">
          <div className="cta-ambient-glow"></div>

          <div className="thought-left">
            <div className="thought-badge">
              <i className="ri-lightbulb-flash-fill"></i>
              <span>DAILY WISDOM</span>
            </div>
            <p className="thought-quote">"{dailyThought}"</p>
            <span className="thought-author">— EduConnect Pro Academic Council</span>
          </div>

          <div className="cta-right">
            <h3>Ready to accelerate your tech career?</h3>
            <p>Join thousands of active students and access high-demand certifications today.</p>
            <div className="cta-btn-group">
              <Link to="/register" className="cta-btn-primary">
                <span>Start Learning Free</span>
                <i className="ri-arrow-right-line"></i>
              </Link>
              <Link to="/login" className="cta-btn-secondary">
                <span>Explore Demo Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
