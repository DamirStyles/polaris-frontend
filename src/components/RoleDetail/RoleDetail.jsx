// src/components/RoleDetail/RoleDetail.jsx
// Displays detailed information about a target role across 4 scrollable pages
// Uses smooth continuous scrolling with arrow key navigation

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import './RoleDetail.css';

/**
 * RoleDetail Component
 * 
 * Displays 4 pages of content about a target role:
 * 1. Overview - Salary, degree, role description
 * 2. Day in the Life - Typical tasks and responsibilities
 * 3. Sweet Spots - Skills that transfer from current role
 * 4. Areas for Growth - New skills to develop for target role
 * 
 * Navigation: Arrow keys for smooth scrolling between pages
 */
const RoleDetail = ({ roleName, currentRole, metrics, userSkills, onBack }) => {
  const [pages, setPages] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const keysPressed = useRef({ ArrowDown: false, ArrowUp: false });
  const animationFrameRef = useRef(null);

  /**
   * Fetch AI-generated content for all 4 pages
   */
  const fetchRolePages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getRolePages(roleName, currentRole, metrics, userSkills);
      setPages(data.pages || []);
      setScrollPosition(0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching role pages:', err);
    } finally {
      setLoading(false);
    }
  }, [roleName, currentRole, metrics, userSkills]);

  useEffect(() => {
    fetchRolePages();
  }, [fetchRolePages]);

  /**
   * Smooth scrolling animation loop
   * Updates scroll position continuously while arrow keys are held
   */
  useEffect(() => {
    const animate = () => {
      if (keysPressed.current.ArrowDown) {
        setScrollPosition(prev => Math.min(prev + 0.015, pages.length - 1));
      } else if (keysPressed.current.ArrowUp) {
        setScrollPosition(prev => Math.max(prev - 0.015, 0));
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [pages.length]);

  /**
   * Keyboard event handlers for arrow key navigation
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        keysPressed.current[e.key] = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        keysPressed.current[e.key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (loading) {
    return (
      <div className="role-detail-container">
        <div className="role-detail-loading-container">
          <p className="role-detail-loading-text">Loading role details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="role-detail-container">
        <div className="role-detail-loading-container">
          <p style={{ color: '#dc2626', marginBottom: '1.5rem' }}>Error: {error}</p>
          <button className="role-detail-back-button" onClick={onBack}>
            Back to Roles
          </button>
        </div>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className="role-detail-container">
        <div className="role-detail-loading-container">
          <p className="role-detail-loading-text">No pages available</p>
        </div>
      </div>
    );
  }

  const currentPageIndex = Math.floor(scrollPosition);

  return (
    <div className="role-detail-container">
      {/* Pages container with smooth scroll effect */}
      <div className="role-detail-pages-wrapper">
        {pages.map((page, index) => {
          const offset = index - scrollPosition;
          
          let translateY, scale, opacity, zIndex, visibility;
          
          // Calculate positioning based on offset from current scroll position
          // Creates the "deck of cards" effect where pages slide and scale
          if (offset > 1) {
            // Pages far below - hidden
            translateY = 100;
            scale = 0.85;
            opacity = 0;
            zIndex = 5;
            visibility = 'hidden';
          } else if (offset > 0) {
            // Next page sliding up
            translateY = offset * 100;
            scale = 0.85 + ((1 - offset) * 0.15);
            opacity = 1;
            zIndex = 20;
            visibility = 'visible';
          } else if (offset >= -0.01) {
            // Current page
            translateY = 0;
            scale = 1;
            opacity = 1;
            zIndex = 10;
            visibility = 'visible';
          } else if (offset >= -1) {
            // Previous page sliding down
            translateY = 0;
            scale = 1 + (offset * 0.25);
            opacity = 1 + offset;
            zIndex = 5;
            visibility = 'visible';
          } else {
            // Pages far above - hidden
            translateY = 0;
            scale = 0.75;
            opacity = 0;
            zIndex = 1;
            visibility = 'hidden';
          }

          return (
            <div
              key={index}
              className="role-detail-page"
              style={{
                transform: `translate(-50%, -50%) translateY(${translateY}%) scale(${scale})`,
                opacity,
                zIndex,
                visibility,
              }}
            >
              <PageContent page={page} roleName={roleName} />
            </div>
          );
        })}
      </div>

      <div className="role-detail-button-wrapper">
        <button onClick={onBack} className="shimmer-button">
          ← Back
        </button>
      </div>

      {/* Navigation hints - page counter and arrow indicators */}
      <div className="role-detail-nav-hint">
        <div className="role-detail-page-counter">
          {currentPageIndex + 1} / {pages.length}
        </div>
        <div className="role-detail-arrow-indicators">
          {scrollPosition > 0.1 && (
            <ChevronUp className="role-detail-nav-arrow" />
          )}
          {scrollPosition < pages.length - 1.1 && (
            <ChevronDown className="role-detail-nav-arrow" />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * PageContent Component
 * Renders appropriate content based on page type
 */
const PageContent = ({ page, roleName }) => {
  // Page Type 1: Overview
  if (page.type === 'overview') {
    return (
      <div className="role-detail-page-content">
        <p className="role-detail-page-intro">Imagine yourself as:</p>
        <h1 className="role-detail-page-title">
          <span className="role-detail-title-color-1">{roleName.split(' ')[0]}</span>
          <span className="role-detail-title-color-2">
            {roleName.split(' ').slice(1).join(' ')}
          </span>
        </h1>
        <p className="role-detail-page-description">{page.description}</p>
        <div className="role-detail-info-group">
          <div className="role-detail-info-item">
            <span className="role-detail-info-icon">💰</span>
            <div>
              <p className="role-detail-info-label">Avg. Salary</p>
              <p className="role-detail-info-value">{page.salary}</p>
            </div>
          </div>
          <div className="role-detail-info-item">
            <span className="role-detail-info-icon">📚</span>
            <div>
              <p className="role-detail-info-label">Typical Degree</p>
              <p className="role-detail-info-value">{page.degree}</p>
            </div>
          </div>
        </div>
        {page.source && (
          <p className="role-detail-page-source">Source: {page.source}</p>
        )}
      </div>
    );
  }

  // Page Type 2: Day in the Life
  if (page.type === 'day_in_life') {
    return (
      <div className="role-detail-page-content">
        <h2 className="role-detail-section-title">
          <span className="role-detail-section-icon">📋</span> A day in the life
        </h2>
        <p className="role-detail-page-intro">
          Here's what a day in the life of a(n) <span className="role-detail-role-highlight">{roleName}</span> might look like.
        </p>
        <div className="role-detail-tasks-list">
          {page.tasks && page.tasks.map((task, idx) => (
            <div key={idx} className="role-detail-task-card">{task}</div>
          ))}
        </div>
      </div>
    );
  }

  // Page Type 3: Sweet Spots (Transferable Skills)
  if (page.type === 'sweet_spots') {
    return (
      <div className="role-detail-page-content">
        <h2 className="role-detail-section-title">
          <span className="role-detail-section-icon">👍</span> Sweet spots
        </h2>
        <p className="role-detail-page-intro">
          Consider how the role of a(n) <span className="role-detail-role-highlight">{roleName}</span> may overlap with where you are now.
        </p>
        <div className="role-detail-skills-tags">
          {page.skills && page.skills.map((skill, idx) => (
            <span key={idx} className="role-detail-skill-tag">{skill}</span>
          ))}
        </div>
        <div className="role-detail-explanation-box role-detail-explanation-box-green">
          <p>{page.explanation}</p>
        </div>
      </div>
    );
  }

  // Page Type 4: Areas for Growth 
  if (page.type === 'areas_for_growth') {
    return (
      <div className="role-detail-page-content">
        <h2 className="role-detail-section-title">
          <span className="role-detail-section-icon">ℹ️</span> Areas for growth
        </h2>
        <p className="role-detail-page-intro">
          Every career presents opportunities to learn and specialize in new areas. Here's what that could look like as a(n) <span className="role-detail-role-highlight">{roleName}</span>.
        </p>
        <div className="role-detail-skills-tags">
          {page.skills && page.skills.map((skill, idx) => (
            <span key={idx} className="role-detail-skill-tag role-detail-skill-tag-growth">{skill}</span>
          ))}
        </div>
        <div className="role-detail-explanation-box role-detail-explanation-box-blue">
          <p>{page.explanation}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default RoleDetail;