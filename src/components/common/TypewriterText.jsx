import React, { useState, useEffect } from 'react';
import './TypewriterText.css';

/**
 * TypewriterText Component
 * 
 * Animates text with a typewriter effect, character by character
 * 
 * @param {string} text - The text to animate
 * @param {number} speed - Milliseconds per character (default: 50)
 * @param {function} onComplete - Callback when animation finishes
 */
const TypewriterText = ({ text, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [hasCompleted, setHasCompleted] = useState(false);
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        if (!hasCompleted && onComplete) {
          setHasCompleted(true);
          onComplete();
        }
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, hasCompleted, onComplete]);
  
  return (
    <h2 className="typewriter-text">
      {displayedText}
      <span className="cursor">|</span>
    </h2>
  );
};

export default TypewriterText;