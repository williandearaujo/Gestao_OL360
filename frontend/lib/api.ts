import axios, { AxiosInstance } from 'axios';

const resolveBaseURL = () => {
  if (typeof window !== 'undefined') {
    const fromGlobal = (window as any).__API_URL__;
    if (fromGlobal) return fromGlobal;
    const fromEnv = (process as any).env.NEXT_PUBLIC_API_URL;
    if (fromEnv) return fromEnv;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
};

const api: AxiosInstance = axios.create({
  baseURL: resolveBaseURL(),
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then((res) => res.data);

export const getMe = () => api.get('/auth/me').then((res) => res.data);
export const getEmployees = () => api.get('/employees/').then((res) => res.data);
export const getEmployeeById = (id: string) => api.get(`/employees/${id}`).then((res) => res.data);
export const createEmployee = (data: any) => api.post('/employees/', data).then((res) => res.data);
export const updateEmployee = (id: string, data: any) => api.put(`/employees/${id}`, data).then((res) => res.data);
export const deleteEmployee = (id: string) => api.delete(`/employees/${id}`).then((res) => res.data);

export const getTeams = () => api.get('/teams/').then((res) => res.data);
export const createTeam = (data: any) => api.post('/teams/', data).then((res) => res.data);
export const getManagers = () => api.get('/managers/').then((res) => res.data);
export const createManagerRecord = (employeeId: string) =>
  api.post('/managers/', { employee_id: employeeId }).then((res) => res.data);
export const getSupervisors = () => api.get('/employees/supervisors').then((res) => res.data);
export const getKnowledge = () => api.get('/knowledge/').then((res) => res.data);
export const createKnowledge = (data: any) => api.post('/knowledge/', data).then((res) => res.data);
export const getEmployeeKnowledge = () => api.get('/employee-knowledge/').then((res) => res.data);
export const createEmployeeKnowledge = (data: any) => api.post('/employee-knowledge/', data).then((res) => res.data);
export const getAreas = () => api.get('/areas/').then((res) => res.data);
export const createArea = (data: any) => api.post('/areas/', data).then((res) => res.data);
export const getAlerts = () => api.get('/alerts/').then((res) => res.data);
export const getDashboardData = () => api.get('/dashboard/').then((res) => res.data);

export const getDayOffs = (employeeId: string) =>
  api.get('/day-offs/', { params: { employee_id: employeeId } }).then((res) => res.data);
export const createDayOff = (data: any) => api.post('/day-offs/', data).then((res) => res.data);
export const updateDayOff = (id: string, data: any) => api.patch(`/day-offs/${id}`, data).then((res) => res.data);
export const deleteDayOff = (id: string) => api.delete(`/day-offs/${id}`).then((res) => res.data);

export const getOneOnOnes = (employeeId: string) =>
  api.get('/one-on-ones/', { params: { employee_id: employeeId } }).then((res) => res.data);
export const createOneOnOne = (data: any) => api.post('/one-on-ones/', data).then((res) => res.data);
export const updateOneOnOne = (id: string, data: any) => api.patch(`/one-on-ones/${id}`, data).then((res) => res.data);
export const deleteOneOnOne = (id: string) => api.delete(`/one-on-ones/${id}`).then((res) => res.data);

export const getPdiLogs = (employeeId: string) =>
  api.get('/pdi/', { params: { employee_id: employeeId } }).then((res) => res.data);
export const createPdiLog = (data: any) => api.post('/pdi/', data).then((res) => res.data);
export const updatePdiLog = (id: string, data: any) => api.patch(`/pdi/${id}`, data).then((res) => res.data);
export const deletePdiLog = (id: string) => api.delete(`/pdi/${id}`).then((res) => res.data);

export default api;
