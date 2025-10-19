// App.js - Main application component
// Handles routing between onboarding steps and role exploration

import React, { useState } from 'react';
import './App.css';
import api from './services/api';

import LandingPage from './pages/LandingPage';
import CurrentRolePage from './pages/CurrentRolePage';
import SkillsPage from './pages/SkillsPage';
import RoleMap from './components/RoleMap/RoleMap';
import RoleDetail from './components/RoleDetail/RoleDetail';

const App = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    currentRole: '',
    skills: [],
    targetRole: '',
    industry: '',
    metrics: null
  });
  const [error, setError] = useState(null);
  const [errorFading, setErrorFading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const setErrorWithFade = (message, duration = 2000) => {
    setError(message);
    setErrorFading(false);
    
    setTimeout(() => setErrorFading(true), duration);
    
    setTimeout(() => {
      setError(null);
      setErrorFading(false);
    }, duration + 1000);
  };

  const validateAndInferIndustry = async () => {
    const trimmed = formData.currentRole.trim();
    
    setError(null);
    
    if (trimmed.length < 2) {
      setErrorWithFade("Please enter a role");
      return false;
    }
    
    if (trimmed.length > 100) {
      setErrorWithFade("Role name too long (max 100 characters)");
      return false;
    }
    
    if (!/[a-zA-Z]/.test(trimmed)) {
      setErrorWithFade("Please enter a valid job role");
      return false;
    }
    
    const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < 3) {
      setErrorWithFade("Please enter a valid job role (e.g., 'Software Engineer')");
      return false;
    }
    
    setIsValidating(true);
    
    try {
      const result = await api.inferIndustry(trimmed);
      
      if (result.confidence < 0.5) {
        setErrorWithFade("We couldn't recognize that role. Try something like 'Software Engineer' or 'Product Manager'");
        return false;
      }
      
      if (result.industry !== "Technology") {
        setErrorWithFade(`Polaris currently focuses on Technology careers. We detected your role is in ${result.industry}.`, 3000);
        return false;
      }
      
      setFormData({
        ...formData, 
        currentRole: trimmed, 
        industry: result.industry,
        metrics: {
          technical: result.technical,
          creative: result.creative,
          business: result.business,
          customer: result.customer
        }
      });
      return true;
      
    } catch (err) {
      setErrorWithFade("Unable to validate role. Please check your connection and try again.");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setFormData({
      currentRole: '',
      skills: [],
      targetRole: '',
      industry: '',
      metrics: null
    });
  };

  const handleCurrentRoleNext = async () => {
    if (formData.currentRole && !isValidating) {
      const isValid = await validateAndInferIndustry();
      if (isValid) {
        setStep(2);
      }
    }
  };

  return (
    <>
      {step === 0 && (
        <LandingPage onStartAnalysis={() => setStep(1)} />
      )}
      
      {step === 1 && (
        <div className="app-container">
          <div className="content-wrapper">
            <CurrentRolePage
              formData={formData}
              onFormDataChange={setFormData}
              onNext={handleCurrentRoleNext}
              onBack={() => setStep(0)}
              error={error}
              onClearError={() => {
                setError(null);
                setErrorFading(false);
              }}
              errorFading={errorFading}
              isValidating={isValidating}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="app-container">
          <div className="content-wrapper">
            <SkillsPage
              formData={formData}
              onFormDataChange={setFormData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              error={error}
              setError={setErrorWithFade}
              errorFading={errorFading}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="app-container">
          <div className="content-wrapper">
            <RoleMap
              currentRole={formData.currentRole}
              metrics={formData.metrics}
              onRoleSelect={(role) => {
                setFormData({...formData, targetRole: role});
                setStep(4);
              }}
              onBack={() => setStep(2)}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="app-container" style={{ padding: 0 }}>
          <div className="content-wrapper">
            <RoleDetail
              roleName={formData.targetRole}
              currentRole={formData.currentRole}
              metrics={formData.metrics}
              userSkills={formData.skills}
              onBack={() => setStep(3)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default App;