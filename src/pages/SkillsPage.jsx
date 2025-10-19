// SkillsPage.jsx - Skills selection step
// Displays AI-suggested skills and allows custom skill search

import React, { useState, useEffect } from 'react';
import TypewriterText from '../components/common/TypewriterText';
import api from '../services/api';
import skillsData from '../data/known_skills.json';

const SkillsPage = ({ 
  formData, 
  onFormDataChange, 
  onNext, 
  onBack,
  error,
  setError,
  errorFading
}) => {
  const [selectedSkills, setSelectedSkills] = useState(formData.skills);
  const [customSkills, setCustomSkills] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [page2Typed, setPage2Typed] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const result = await api.suggestSkills(formData.currentRole);
        setSuggestedSkills(result.skills || []);
      } catch (err) {
        setSuggestedSkills([
          'Python', 'JavaScript', 'React', 'Communication', 
          'Leadership', 'Problem Solving', 'SQL', 'Git'
        ]);
      } finally {
        setIsLoadingSkills(false);
      }
    };
    
    fetchSkills();
  }, [formData.currentRole]);

  const topSkills = suggestedSkills;
  const allSkills = Object.values(skillsData).flat();
  
  const filteredSkills = searchTerm 
    ? allSkills.filter(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 3)
    : [];
  
  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  
  const addSkillFromSearch = (skill) => {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) return;
    
    const isValidSkill = allSkills.some(s => 
      s.toLowerCase() === trimmedSkill.toLowerCase()
    );
    
    if (!isValidSkill) {
      setError("Please select a skill from the suggestions");
      return;
    }
    
    if (!selectedSkills.includes(trimmedSkill)) {
      setSelectedSkills([...selectedSkills, trimmedSkill]);
    }
    if (!topSkills.includes(trimmedSkill) && !customSkills.includes(trimmedSkill)) {
      setCustomSkills([...customSkills, trimmedSkill]);
    }
    setSearchTerm('');
    setShowSearch(false);
  };
  
  const handleKeyPress = (e) => {
    const filteredSkills = searchTerm 
      ? allSkills.filter(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 3)
      : [];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredSkills.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredSkills.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      addSkillFromSearch(filteredSkills[highlightedIndex]);
      setHighlightedIndex(-1);
    }
  };
  
  const handleNext = () => {
    if (selectedSkills.length < 2) {
      setError("Please select at least 2 skills to continue", 2500);
      return;
    }
    onFormDataChange({ ...formData, skills: selectedSkills });
    onNext();
  };

  return (
    <div className="floating-step-page">
      <div className="content-container">
        {!page2Typed ? (
          <TypewriterText text="What skills do you have?" onComplete={() => setPage2Typed(true)} />
        ) : (
          <h2 className="typewriter-text">What skills do you have?</h2>
        )}
        <p className="subtitle">Select at least 2 skills to see personalized role overlaps</p>
        
        {showSearch && <div className="search-overlay" onClick={() => {
          setShowSearch(false);
          setSearchTerm('');
        }}></div>}
        
        {isLoadingSkills ? (
          <div className="skills-loading">Loading skills for {formData.currentRole}...</div>
        ) : (
          <div className="skills-grid">
            {topSkills.slice(0, 8).map((skill, index) => (
              <button
                key={index}
                onClick={() => toggleSkill(skill)}
                className={`skill-pill ${selectedSkills.includes(skill) ? 'selected' : ''}`}
              >
                {skill}
              </button>
            ))}
            
            {customSkills.map((skill, index) => (
              <button
                key={`custom-${index}`}
                onClick={() => toggleSkill(skill)}
                className={`skill-pill ${selectedSkills.includes(skill) ? 'selected' : ''}`}
              >
                {skill}
              </button>
            ))}
            
            {!showSearch ? (
              <button 
                className="show-more-button-inline"
                onClick={() => setShowSearch(true)}
              >
                More Skills +
              </button>
            ) : (
              <div className="search-field-inline">
                <input
                  type="text"
                  className="inline-search-input"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  onKeyDown={handleKeyPress}
                  onBlur={() => setTimeout(() => {
                    setShowSearch(false);
                    setSearchTerm('');
                    setHighlightedIndex(-1);
                  }, 200)}
                  autoFocus
                />
                {searchTerm && filteredSkills.length > 0 && (
                  <div className="skills-dropup">
                    {filteredSkills.map((skill, idx) => (
                      <div
                        key={idx}
                        className={`dropup-item ${highlightedIndex === idx ? 'highlighted' : ''}`}
                        onClick={() => addSkillFromSearch(skill)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div 
            className={`error-message ${errorFading ? 'error-fade-out' : ''}`}
            style={{
              position: 'absolute',
              bottom: '8rem',
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
      </div>
      
      <div className="button-group-corner-right">
        <button className="back-button-colored" onClick={onBack}>
          Back
        </button>
        <button 
          className={`shimmer-button ${selectedSkills.length < 2 ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={selectedSkills.length < 2}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SkillsPage;