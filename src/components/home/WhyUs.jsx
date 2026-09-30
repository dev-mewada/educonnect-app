import React from 'react';

export default function WhyUs() {
  const features = [
    {
      icon: 'ri-vidicon-fill',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      title: 'Live Interactive Classes',
      description: 'Stream in HD with synchronized live chat, interactive whiteboards, and automatic attendance logging.'
    },
    {
      icon: 'ri-shield-check-fill',
      gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      title: 'Enterprise-Grade Security',
      description: 'Role-based access controls, encrypted peer messaging, and full administrative audit transparency.'
    },
    {
      icon: 'ri-medal-fill',
      gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)',
      title: 'Accredited Certificates',
      description: 'Download verifiable digital certificates upon passing rigorous practical assignments and capstones.'
    },
    {
      icon: 'ri-bar-chart-box-fill',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      title: 'Smart Analytics & Insights',
      description: 'Monitor learning velocity, test scores, lecture attendance, and milestones through intuitive dashboards.'
    }
  ];

  return (
    <section className="modern-section why-us-section" id="about">
      <div className="container">
        <div className="section-header-center">
          <div className="section-pill">
            <i className="ri-sparkling-fill"></i>
            WHY EDUCONNECT PRO
          </div>
          <h2 className="section-heading">Everything You Need To Master New Skills</h2>
          <p className="section-lead">
            Built from the ground up for modern learners, professional educators, and forward-thinking academic institutions.
          </p>
        </div>

        <div className="features-grid-modern">
          {features.map((feature, idx) => (
            <div className="modern-feature-card" key={idx}>
              <div className="feature-icon-wrapper" style={{ background: feature.gradient }}>
                <i className={feature.icon}></i>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
              <div className="feature-card-glow"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
