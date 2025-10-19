// src/components/RoleMap/RoleMap.jsx
// Interactive map displaying roles positioned by work style metrics

import React, { useState, useEffect, useCallback } from 'react';
import './RoleMap.css';
import api from '../../services/api';

const RoleMap = ({ onRoleSelect, currentRole, metrics, onBack }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [personalized, setPersonalized] = useState(false);

  const WIDTH = 1200;
  const HEIGHT = 750;
  const PADDING = 100;

  const applyDistanceAwareSpacing = useCallback((nodes) => {
    const minDistance = 128;
    const maxIterations = 70;
    
    for (let iter = 0; iter < maxIterations; iter++) {
      let adjusted = false;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < minDistance && distance > 0) {
            const overlap = minDistance - distance;
            const angle = Math.atan2(dy, dx);
            
            const pushX = Math.cos(angle) * overlap * 0.4;
            const pushY = Math.sin(angle) * overlap * 0.4;
            
            nodes[i].x -= pushX;
            nodes[i].y -= pushY;
            nodes[j].x += pushX;
            nodes[j].y += pushY;
            
            nodes[i].x = Math.max(PADDING + 50, Math.min(WIDTH - PADDING - 50, nodes[i].x));
            nodes[i].y = Math.max(PADDING + 50, Math.min(HEIGHT - PADDING - 60, nodes[i].y));
            nodes[j].x = Math.max(PADDING + 50, Math.min(WIDTH - PADDING - 50, nodes[j].x));
            nodes[j].y = Math.max(PADDING + 50, Math.min(HEIGHT - PADDING - 60, nodes[j].y));
            
            adjusted = true;
          }
        }
      }
      
      if (!adjusted) break;
    }
    
    return nodes;
  }, [PADDING, WIDTH]);

  const fetchPersonalizedRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getMapRoles(currentRole, metrics);
      setPersonalized(data.personalized || false);
      
      const positionedRoles = data.roles.map((role, index) => {
        const peopleScore = (role.business + role.creative) / 2;
        const systemsScore = (role.technical + (10 - role.business)) / 2;
        const xRatio = systemsScore / (peopleScore + systemsScore);
        
        const strategicScore = (role.creative + role.business) / 2;
        const tacticalScore = (role.technical + role.customer) / 2;
        const yRatio = tacticalScore / (strategicScore + tacticalScore);
        
        const baseDistance = role.distance !== undefined ? role.distance : 5;
        const scaledDistance = baseDistance * 35;
        
        const angle = Math.atan2(yRatio - 0.5, xRatio - 0.5) + (index * 0.1);
        
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2;
        
        const x = centerX + scaledDistance * Math.cos(angle);
        const y = centerY + scaledDistance * Math.sin(angle);
        
        const clampedX = Math.max(PADDING + 50, Math.min(WIDTH - PADDING - 50, x));
        const clampedY = Math.max(PADDING + 50, Math.min(HEIGHT - PADDING - 60, y));
        
        return {
          name: role.name,
          x: clampedX,
          y: clampedY,
          color: role.color,
          distance: baseDistance,
          floatOffset: Math.random() * 2,
          placed: false
        };
      });

      const spreadRoles = applyDistanceAwareSpacing(positionedRoles);
      setRoles(spreadRoles);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching personalized roles:', err);
    } finally {
      setLoading(false);
    }
  }, [currentRole, metrics, WIDTH, HEIGHT, PADDING, applyDistanceAwareSpacing]);

  useEffect(() => {
    fetchPersonalizedRoles();
  }, [fetchPersonalizedRoles]);

  const handleRoleClick = (role) => {
    if (onRoleSelect) {
      onRoleSelect(role.name);
    }
  };

  if (loading) {
    return (
      <div className="floating-step-page">
        <div className="role-map-container">
          <div className="role-map-header">
            <h2>Loading personalized roles...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="floating-step-page">
        <div className="role-map-container">
          <div className="role-map-header">
            <h2>Error loading roles</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="floating-step-page">
      <div className="role-map-container">
        <div className="role-map-header">
          <h2>Select Your Target Role</h2>
          <p>
            {personalized 
              ? `Personalized roles based on ${currentRole}` 
              : 'Roles positioned by work style and focus area'}
          </p>
        </div>

        <svg width={WIDTH} height={HEIGHT} className="role-map-svg">
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f3e8ff" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#bgGradient)" rx="16" />

          <line x1={WIDTH * 0.25} y1={PADDING} x2={WIDTH * 0.25} y2={HEIGHT - PADDING} stroke="#cbd5e0" strokeWidth="1" opacity="0.3" />
          <line x1={WIDTH * 0.75} y1={PADDING} x2={WIDTH * 0.75} y2={HEIGHT - PADDING} stroke="#cbd5e0" strokeWidth="1" opacity="0.3" />
          <line x1={PADDING} y1={HEIGHT * 0.25} x2={WIDTH - PADDING} y2={HEIGHT * 0.25} stroke="#cbd5e0" strokeWidth="1" opacity="0.3" />
          <line x1={PADDING} y1={HEIGHT * 0.75} x2={WIDTH - PADDING} y2={HEIGHT * 0.75} stroke="#cbd5e0" strokeWidth="1" opacity="0.3" />
          
          <line x1={WIDTH * 0.5} y1={PADDING} x2={WIDTH * 0.5} y2={HEIGHT - PADDING} stroke="#94a3b8" strokeWidth="2" opacity="0.6" />
          <line x1={PADDING} y1={HEIGHT * 0.5} x2={WIDTH - PADDING} y2={HEIGHT * 0.5} stroke="#94a3b8" strokeWidth="2" opacity="0.6" />

          <text x={WIDTH/2} y={30} textAnchor="middle" className="axis-label">Strategic / Conceptual</text>
          <text x={WIDTH/2} y={HEIGHT - 15} textAnchor="middle" className="axis-label">Tactical / Execution</text>
          <text x={25} y={HEIGHT/2} textAnchor="middle" className="axis-label" transform={`rotate(-90, 25, ${HEIGHT/2})`}>People-Focused</text>
          <text x={WIDTH - 25} y={HEIGHT/2} textAnchor="middle" className="axis-label" transform={`rotate(90, ${WIDTH - 25}, ${HEIGHT/2})`}>Systems-Focused</text>

          {roles.map((role, index) => (
            <g 
              key={role.name} 
              className="role-button-group"
              onClick={() => handleRoleClick(role)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={role.x}
                cy={role.y}
                r={6}
                fill={role.color}
                className="role-dot"
                style={{
                  animation: `float 3s ease-in-out infinite`,
                  animationDelay: `${role.floatOffset}s`
                }}
              />
              <text
                x={role.x}
                y={role.y + 18}
                textAnchor="middle"
                className="role-label"
                style={{
                  animation: `float 3s ease-in-out infinite`,
                  animationDelay: `${role.floatOffset}s`
                }}
              >
                {role.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {onBack && (
        <div className="button-group-corner-right">
          <button className="back-button-colored" onClick={onBack}>
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleMap;