// CurrentRolePage.jsx - Current role input step
// First step in onboarding with animated intro

import React, { useState, useEffect } from 'react';
import TypewriterText from '../components/common/TypewriterText';

const CurrentRolePage = ({ 
  formData, 
  onFormDataChange, 
  onNext, 
  onBack,
  error,
  onClearError,
  errorFading,
  isValidating
}) => {
  const [page1Typed, setPage1Typed] = useState(false);
  const [showHello, setShowHello] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [animationsPlayed, setAnimationsPlayed] = useState(false);
  const [showInputs, setShowInputs] = useState(false);

  useEffect(() => {
    if (!animationsPlayed) {
      const helloTimer = setTimeout(() => {
        setShowHello(true);
      }, 500);

      const questionTimer = setTimeout(() => {
        setShowHello(false);
        setTimeout(() => {
          setShowQuestion(true);
        }, 500);
      }, 2500);

      return () => {
        clearTimeout(helloTimer);
        clearTimeout(questionTimer);
      };
    }
  }, [animationsPlayed]);

  const handleBack = () => {
    setShowInputs(false);
    setShowQuestion(false);
    setShowHello(false);
    setAnimationsPlayed(false);
    onClearError();
    onBack();
  };

  return (
    <div className="floating-step-page">
      {showHello && !showQuestion && (
        <h1 className="hello-text fade-in-out">Hello</h1>
      )}
      
      {showQuestion && (
        <div className="content-container">
          <div className="question-header">
            {!page1Typed ? (
              <TypewriterText 
                text="What's your current role?" 
                onComplete={() => {
                  setPage1Typed(true);
                  setTimeout(() => {
                    setShowInputs(true);
                    setTimeout(() => {
                      setAnimationsPlayed(true);
                    }, 700);
                  }, 100);
                }} 
              />
            ) : (
              <h2 className="typewriter-text">What's your current role?</h2>
            )}
          </div>
          
          {showInputs && (
            <>
              <input
                type="text"
                className={`floating-input ${animationsPlayed ? '' : 'slide-up'}`}
                placeholder="e.g., Software Engineer, Product Manager, Data Analyst"
                value={formData.currentRole}
                onChange={(e) => {
                  onFormDataChange({ ...formData, currentRole: e.target.value });
                  if (error) {
                    onClearError();
                  }
                }}
                autoFocus
                maxLength={100}
              />
              
              {error && (
                <div 
                  className={`error-message ${errorFading ? 'error-fade-out' : ''}`}
                  style={{
                    position: 'absolute', 
                    top: '15rem', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    width: '500px', 
                    maxWidth: '90%',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                >
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {showInputs && (
        <div className="button-group-corner-right">
          <button className="back-button-colored" onClick={handleBack}>
            Back
          </button>
          <button 
            className={`shimmer-button ${(!formData.currentRole || isValidating) ? 'disabled' : ''}`}
            onClick={onNext}
            disabled={!formData.currentRole || isValidating}
          >
            {isValidating ? 'Validating...' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrentRolePage;