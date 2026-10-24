/**
 * REST API Client for Python FastAPI Backend & MongoDB Sync
 * Includes JWT Auth Management and Offline-Safe LocalStorage Fallback.
 */

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const API_URL = `${API_BASE}/api`;

const TOKEN_KEY = 'cgpa_jwt_token';
const USER_KEY = 'cgpa_user_profile';
const LOCAL_BACKUP_KEY = 'cgpa_local_semesters_store';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Generic fetch wrapper with automatic JWT Bearer headers
async function request(endpoint, options = {}) {
  const token = authStorage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      authStorage.clear();
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.detail || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Check backend server health
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
      if (!response.ok) return { isOnline: false, status: 'error' };
      const data = await response.json();
      return { isOnline: true, ...data };
    } catch {
      return { isOnline: false, status: 'unreachable' };
    }
  },

  // Auth Endpoints
  async register(userData) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.access_token) {
      authStorage.setToken(data.access_token);
      authStorage.setUser(data.user);
    }
    return data;
  },

  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      authStorage.setToken(data.access_token);
      authStorage.setUser(data.user);
    }
    return data;
  },

  logout() {
    authStorage.clear();
  },

  async getProfile() {
    const data = await request('/auth/me');
    authStorage.setUser(data);
    return data;
  },

  // Transcript Sync Endpoints (MongoDB)
  async saveTranscript(transcriptPayload) {
    return await request('/transcripts', {
      method: 'POST',
      body: JSON.stringify(transcriptPayload),
    });
  },

  async getLatestTranscript() {
    return await request('/transcripts/latest');
  },

  async getAllTranscripts() {
    return await request('/transcripts');
  },

  async updateTranscript(id, payload) {
    return await request(`/transcripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteTranscript(id) {
    return await request(`/transcripts/${id}`, {
      method: 'DELETE',
    });
  },

  // Calculator REST Endpoints
  async calculateSemester(courses, regulationKey = 'AU_2021') {
    return await request('/calculate/semester', {
      method: 'POST',
      body: JSON.stringify({ courses, regulation_key: regulationKey }),
    });
  },

  async calculateCGPA(semesters, regulationKey = 'AU_2021') {
    return await request('/calculate/cgpa', {
      method: 'POST',
      body: JSON.stringify({ semesters, regulation_key: regulationKey }),
    });
  },

  async calculateWhatIf(params) {
    return await request('/calculate/whatif', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Local storage backup fallback
  saveLocalBackup(data) {
    try {
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  },

  getLocalBackup() {
    try {
      const data = localStorage.getItem(LOCAL_BACKUP_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};

export default api;
