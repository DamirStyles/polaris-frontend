// LandingPage.jsx - Landing page with hero section
// First page users see when visiting the app

import React from 'react';

const LandingPage = ({ onStartAnalysis }) => {
  return (
    <div className="landing-page">
      <div className="landing-background"></div>

      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-nav-content">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4299e1" />
                  <stop offset="50%" stopColor="#48bb78" />
                  <stop offset="100%" stopColor="#9ae6b4" />
                </linearGradient>
              </defs>
              <path d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z" fill="url(#starGrad)" opacity="0.9"/>
              <circle cx="50" cy="50" r="6" fill="url(#starGrad)"/>
            </svg>
            <span className="landing-logo-text">Polaris</span>
          </div>
        </div>
      </nav>

      <div className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-title">
            Navigate your tech career path with confidence.
          </h1>
          <p className="landing-subtitle">
            Polaris analyzes real career paths to show you viable transitions in technology roles, 
            skills gaps, and actionable next steps powered by AI.
          </p>
          <div className="landing-buttons">
            <button onClick={onStartAnalysis} className="landing-button-primary shimmer-button">
              <span>Start Analysis</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;