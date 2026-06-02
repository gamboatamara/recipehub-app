import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authService = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me")
};

export const recipeService = {
  list: (params = {}) => api.get("/recetas", { params }),
  getById: (id) => api.get(`/recetas/${id}`),
  create: (payload) => api.post("/recetas", payload),
  update: (id, payload) => api.put(`/recetas/${id}`, payload),
  remove: (id) => api.delete(`/recetas/${id}`)
};

export const commentService = {
  listByRecipe: (recipeId) => api.get(`/recetas/${recipeId}/comentarios`),
  create: (recipeId, payload) => api.post(`/recetas/${recipeId}/comentarios`, payload),
  remove: (commentId) => api.delete(`/comentarios/${commentId}`)
};

export default api;
