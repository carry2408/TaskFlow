import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getAll: (params) => api.get('/users', { params }),
};

export const teamsApi = {
  getAll: (params) => api.get('/teams', { params }),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  addMember: (teamId, userId) => api.post(`/teams/${teamId}/members/${userId}`),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
  getMembers: (teamId) => api.get(`/teams/${teamId}/members`),
};

export const projectsApi = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  addMember: (projectId, userId, role) => api.post(`/projects/${projectId}/members/${userId}`, null, { params: { role } }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
};

export const issuesApi = {
  getByProject: (projectId, params) => api.get(`/projects/${projectId}/issues`, { params }),
  getById: (id) => api.get(`/issues/${id}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/issues`, data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  transitionStatus: (id, status) => api.patch(`/issues/${id}/status`, null, { params: { status } }),
  getHistory: (id) => api.get(`/issues/${id}/history`),
  search: (params) => api.get('/issues/search', { params }),
};

export const commentsApi = {
  getByIssue: (issueId) => api.get(`/issues/${issueId}/comments`),
  add: (issueId, data) => api.post(`/issues/${issueId}/comments`, data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

export const labelsApi = {
  getAll: () => api.get('/labels'),
  create: (data) => api.post('/labels', data),
  getByIssue: (issueId) => api.get(`/issues/${issueId}/labels`),
  assign: (issueId, labelId) => api.post(`/issues/${issueId}/labels/${labelId}`),
  remove: (issueId, labelId) => api.delete(`/issues/${issueId}/labels/${labelId}`),
};

export const attachmentsApi = {
  getByIssue: (issueId) => api.get(`/issues/${issueId}/attachments`),
  upload: (issueId, formData) => api.post(`/issues/${issueId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDownloadUrl: (id) => `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/attachments/${id}/download`,
};

export const sprintsApi = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/sprints`),
  create: (projectId, data) => api.post(`/projects/${projectId}/sprints`, data),
  updateStatus: (id, status) => api.patch(`/sprints/${id}/status`, null, { params: { status } }),
  getIssues: (sprintId) => api.get(`/sprints/${sprintId}/issues`),
  assignIssue: (sprintId, issueId) => api.post(`/sprints/${sprintId}/issues/${issueId}`),
  removeIssue: (sprintId, issueId) => api.delete(`/sprints/${sprintId}/issues/${issueId}`),
};

export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard'),
};

