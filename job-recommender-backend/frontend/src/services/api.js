// frontend/src/services/api.js
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

  // Application APIs
  applyForJob: async (username, jobId, jobType = 'Job') => {
    const response = await fetch(`${API_BASE}/applications/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, jobId, jobType }),
    });
    return response.json();
  },

  checkApplication: async (username, jobId) => {
    const response = await fetch(`${API_BASE}/applications/check/${username}/${jobId}`);
    return response.json();
  },

  getUserApplications: async (username) => {
    const response = await fetch(`${API_BASE}/applications/user/${username}`);
    return response.json();
  },

  getJobApplications: async (jobId) => {
    const response = await fetch(`${API_BASE}/applications/job/${jobId}`);
    return response.json();
  },

  getApplicationCount: async (jobId) => {
    const response = await fetch(`${API_BASE}/applications/count/${jobId}`);
    return response.json();
  },

  updateApplicationStatus: async (applicationId, status) => {
    const response = await fetch(`${API_BASE}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  getAllEmployerApplications: async () => {
    const response = await fetch(`${API_BASE}/applications/employer/all`);
    return response.json();
  },
};