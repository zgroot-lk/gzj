import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 待办事项API
export const todoAPI = {
  getAll: (params?: any) => api.get('/todos', { params }),
  getById: (id: number) => api.get(`/todos/${id}`),
  create: (data: any) => api.post('/todos', data),
  update: (id: number, data: any) => api.put(`/todos/${id}`, data),
  delete: (id: number) => api.delete(`/todos/${id}`),
};

// 学生API
export const studentAPI = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: number) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: number, data: any) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
};

// 班级API
export const classAPI = {
  getAll: (params?: any) => api.get('/classes', { params }),
  getById: (id: number) => api.get(`/classes/${id}`),
  create: (data: any) => api.post('/classes', data),
  update: (id: number, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
};

// 学籍API
export const recordAPI = {
  getAll: (params?: any) => api.get('/records', { params }),
  getById: (id: number) => api.get(`/records/${id}`),
  getByStudentId: (studentId: number) => api.get(`/records/student/${studentId}`),
  create: (data: any) => api.post('/records', data),
  update: (id: number, data: any) => api.put(`/records/${id}`, data),
  delete: (id: number) => api.delete(`/records/${id}`),
};

// 考勤API
export const attendanceAPI = {
  getAll: (params?: any) => api.get('/attendance', { params }),
  create: (data: any) => api.post('/attendance', data),
  update: (id: number, data: any) => api.put(`/attendance/${id}`, data),
  delete: (id: number) => api.delete(`/attendance/${id}`),
};

// 成绩API
export const gradeAPI = {
  getAll: (params?: any) => api.get('/grades', { params }),
  create: (data: any) => api.post('/grades', data),
  update: (id: number, data: any) => api.put(`/grades/${id}`, data),
  delete: (id: number) => api.delete(`/grades/${id}`),
};

// 课表API
export const scheduleAPI = {
  getAll: (params?: any) => api.get('/schedules', { params }),
  create: (data: any) => api.post('/schedules', data),
  update: (id: number, data: any) => api.put(`/schedules/${id}`, data),
  delete: (id: number) => api.delete(`/schedules/${id}`),
};

// 统计API
export const statisticsAPI = {
  getCount: (params?: any) => api.get('/statistics/count', { params }),
  getTrend: (params?: any) => api.get('/statistics/trend', { params }),
  getCompare: (params?: any) => api.get('/statistics/compare', { params }),
  getOverview: () => api.get('/statistics/overview'),
};

export default api;


