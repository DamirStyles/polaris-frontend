// src/services/api.js
// API service for Polaris backend - centralized location for all API calls

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export const api = {
  // Validate if role is tech-related and get work style metrics
  inferIndustry: async (role) => {
    return fetchAPI('/infer-industry', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  // Get AI-suggested skills for a role
  suggestSkills: async (role) => {
    return fetchAPI('/suggest-skills', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  // Get personalized role recommendations for the interactive map
  getMapRoles: async (currentRole, metrics) => {
    return fetchAPI('/map/roles', {
      method: 'POST',
      body: JSON.stringify({
        current_role: currentRole,
        metrics: metrics,
      }),
    });
  },

  // Get 4 AI-generated detail pages for a specific role
  getRolePages: async (roleName, currentRole, metrics, userSkills = []) => {
    return fetchAPI(`/role/${encodeURIComponent(roleName)}/pages`, {
      method: 'POST',
      body: JSON.stringify({
        role_name: roleName,
        current_role: currentRole,
        metrics: metrics,
        user_skills: userSkills,
      }),
    });
  },
};

export default api;