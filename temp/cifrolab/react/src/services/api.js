import axios from 'axios';
import { getToken, logout } from './auth';

// Create an axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Automatic logout on 401 Unauthorized responses
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const loginUser = (credentials) => {
  return api.post('/login', credentials);
};

export const registerUser = (userData) => {
  return api.post('/register', userData);
};

export const getUserProfile = () => {
  return api.get('/profile');
};

// Employees API
export const getEmployees = (params = {}) => {
  return api.get('/employees', { params });
};

export const getEmployee = (id) => {
  return api.get(`/employees/${id}`);
};

export const createEmployee = (data) => {
  return api.post('/employees', data);
};

export const updateEmployee = (id, data) => {
  return api.put(`/employees/${id}`, data);
};

export const deleteEmployee = (id) => {
  return api.delete(`/employees/${id}`);
};

// Departments API
export const getDepartments = () => {
  return api.get('/departments');
};

export const getDepartment = (id) => {
  return api.get(`/departments/${id}`);
};

export const createDepartment = (data) => {
  return api.post('/departments', data);
};

export const updateDepartment = (id, data) => {
  return api.put(`/departments/${id}`, data);
};

export const deleteDepartment = (id) => {
  return api.delete(`/departments/${id}`);
};

export const getDepartmentStats = () => {
  return api.get('/departments/stats');
};

// Positions API
export const getPositions = () => {
  return api.get('/positions');
};

export const getPosition = (id) => {
  return api.get(`/positions/${id}`);
};

export const createPosition = (data) => {
  return api.post('/positions', data);
};

export const updatePosition = (id, data) => {
  return api.put(`/positions/${id}`, data);
};

export const deletePosition = (id) => {
  return api.delete(`/positions/${id}`);
};

export const getPositionStats = () => {
  return api.get('/positions/stats');
};

// Projects API
export const getProjects = (params = {}) => {
  return api.get('/projects', { params });
};

export const getProject = (id) => {
  return api.get(`/projects/${id}`);
};

export const createProject = (data) => {
  return api.post('/projects', data);
};

export const updateProject = (id, data) => {
  return api.put(`/projects/${id}`, data);
};

export const deleteProject = (id) => {
  return api.delete(`/projects/${id}`);
};

export const getProjectEmployees = (id) => {
  return api.get(`/projects/${id}/employees`);
};

export const addEmployeeToProject = (id, data) => {
  return api.post(`/projects/${id}/employees`, data);
};

export const updateEmployeeProject = (id, data) => {
  return api.put(`/projects/employee-projects/${id}`, data);
};

export const removeEmployeeFromProject = (id) => {
  return api.delete(`/projects/employee-projects/${id}`);
};

export const getProjectStats = () => {
  return api.get('/projects/stats');
};

// Leaves API
export const getLeaves = (params = {}) => {
  return api.get('/leaves', { params });
};

export const getLeave = (id) => {
  return api.get(`/leaves/${id}`);
};

export const createLeave = (data) => {
  return api.post('/leaves', data);
};

export const updateLeave = (id, data) => {
  return api.put(`/leaves/${id}`, data);
};

export const approveLeave = (id) => {
  return api.patch(`/leaves/${id}/approve`);
};

export const rejectLeave = (id) => {
  return api.patch(`/leaves/${id}/reject`);
};

export const deleteLeave = (id) => {
  return api.delete(`/leaves/${id}`);
};

export const getLeaveStats = () => {
  return api.get('/leaves/stats');
};

// Dashboard API
export const getDashboardData = () => {
  return api.get('/dashboard');
};

export const getAdminDashboardData = () => {
  return api.get('/dashboard/admin');
};

export const getManagerDashboardData = () => {
  return api.get('/dashboard/manager');
};

export const getEmployeeDashboardData = () => {
  return api.get('/dashboard/employee');
};

export default api;
