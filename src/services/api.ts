import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    role: string;
    email?: string;
  };
}

export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  medical_id?: string;
  created_at?: string;
  last_visit?: string;
}

export interface Statistics {
  total_patients: number;
  total_reports: number;
  total_xrays: number;
  most_frequent_disease?: string;
  recent_activity?: number;
}

export interface MedicalEntity {
  text: string;
  label: string;
  confidence: number;
  start: number;
  end: number;
}

export interface ReportUploadResponse {
  report_id: string;
  extracted_text: string;
  entities: MedicalEntity[];
  summary: string;
}

export interface XrayAnalysisResponse {
  analysis_id: string;
  pathologies: Array<{
    condition: string;
    probability: number;
    severity?: string;
    location?: string;
  }>;
  report: string;
  segmentation_map?: string;
  recommendations?: string[];
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medical_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medical_auth_token');
      localStorage.removeItem('medical_user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('medical_auth_token');
    localStorage.removeItem('medical_user_data');
  },
  
  getCurrentUser: () => {
    const userData = localStorage.getItem('medical_user_data');
    return userData ? JSON.parse(userData) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('medical_auth_token');
  }
};

// Statistics API
export const statisticsAPI = {
  getEntities: async (): Promise<Statistics> => {
    const response = await api.get('/api/statistics/entities');
    return response.data;
  }
};

// Patients API
export const patientsAPI = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get('/api/patients');
    return response.data;
  },
  
  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/api/patients/${id}`);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/patients/${id}`);
  },
  
  search: async (query: string): Promise<Patient[]> => {
    const response = await api.get(`/api/patients?search=${encodeURIComponent(query)}`);
    return response.data;
  }
};

// Reports API
export const reportsAPI = {
  upload: async (file: File): Promise<ReportUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// X-ray API
export const xrayAPI = {
  analyze: async (file: File): Promise<XrayAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/xray/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  compare: async (file1: File, file2: File): Promise<XrayAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);
    
    const response = await api.post('/api/xray/compare', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  askQuestion: async (analysisId: string, question: string): Promise<{ answer: string }> => {
    const response = await api.post('/api/xray/qna', {
      analysis_id: analysisId,
      question
    });
    return response.data;
  }
};

export default api;