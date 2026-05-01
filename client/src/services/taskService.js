import api from './api.js';

export const taskService = {
  getProjectTasks: (projectId, params) =>
    api.get(`/projects/${projectId}/tasks`, { params }),
  getMyTasks: () => api.get('/tasks/my'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (projectId, data) =>
    api.post(`/projects/${projectId}/tasks`, data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, data) => api.post(`/tasks/${id}/comments`, data),
};
