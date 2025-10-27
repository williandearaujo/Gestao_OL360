import axios from "axios";

// Pega a URL do backend do ambiente, com um fallback para desenvolvimento local
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// MUDANÇA: Funções de API para buscar dados reais (sem mocks)
export const getColaboradores = () => api.get("/employees/");
export const getColaboradorById = (id: string) => api.get(`/employees/${id}`);
export const createColaborador = (data: any) => api.post("/employees/", data);
export const updateColaborador = (id: string, data: any) =>
  api.put(`/employees/${id}`, data);
export const deleteColaborador = (id: string) => api.delete(`/employees/${id}`);

export const getManagers = () => api.get("/managers/");
export const getAreas = () => api.get("/areas/");
export const getTeams = () => api.get("/teams/");

// ... (manter outras chamadas de API se existirem)
