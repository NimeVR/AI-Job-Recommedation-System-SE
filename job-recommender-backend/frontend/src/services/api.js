const API_BASE = 'http://localhost:5000/api';

export const api = {
  register: async (data) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  login: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
  
  createJob: async (jobData, token) => {
    const response = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });
    return response.json();
  },
  
  getAllJobs: async () => {
    const response = await fetch(`${API_BASE}/jobs`);
    return response.json();
  },
  
  getRecommendedJobs: async (username) => {
    const response = await fetch(`${API_BASE}/jobs/recommendations/${username}`);
    return response.json();
  },
};