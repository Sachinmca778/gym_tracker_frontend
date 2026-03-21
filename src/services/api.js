import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// ── Axios Instance ──
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request Interceptor – attach JWT ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor – handle 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${BASE_URL}/gym/auth/refresh`, null, {
          params: { refreshToken },
        });
        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        original.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────
// AUTH  /gym/auth
// ─────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/gym/auth/login', data),
  register: (data) => api.post('/gym/auth/register', data),
  refresh: (token) => api.post('/gym/auth/refresh', null, { params: { refreshToken: token } }),
  logout: (token) => api.post('/gym/auth/logout', null, { params: { token } }),
};

// ─────────────────────────────────────────────────────────
// MEMBERS  /gym/members
// ─────────────────────────────────────────────────────────
export const membersAPI = {
  getAll: () => api.get('/gym/members/all'),
  getById: (id) => api.get(`/gym/members/${id}`),
  getByCode: (code) => api.get(`/gym/members/code/${code}`),
  search: (params) => api.get('/gym/members/search', { params }),
  create: (data) => api.post('/gym/members/create', data),
  createMyProfile: (data) => api.post('/gym/members/create/my-profile', data),
  update: (id, data) => api.put(`/gym/members/${id}`, data),
  delete: (id) => api.delete(`/gym/members/${id}`),
  getExpiring: (days = 7) => api.get('/gym/members/expiring', { params: { days } }),
  getActiveCount: () => api.get('/gym/members/count/active'),
  getDashboardSummary: () => api.get('/gym/members/dashboard/summary'),
};

// ─────────────────────────────────────────────────────────
// TRAINERS  /gym/trainers
// ─────────────────────────────────────────────────────────
export const trainersAPI = {
  getAll: () => api.get('/gym/trainers'),
  getActive: () => api.get('/gym/trainers/active'),
  getById: (id) => api.get(`/gym/trainers/${id}`),
  getBySpecialization: (spec) => api.get(`/gym/trainers/specialization/${spec}`),
  getTopRated: () => api.get('/gym/trainers/top-rated'),
  create: (data) => api.post('/gym/trainers', data),
  update: (id, data) => api.put(`/gym/trainers/${id}`, data),
  delete: (id) => api.delete(`/gym/trainers/${id}`),
};

// ─────────────────────────────────────────────────────────
// MEMBERSHIP PLANS  /gym/membership_plans
// ─────────────────────────────────────────────────────────
export const plansAPI = {
  getAll: () => api.get('/gym/membership_plans/all'),
  getActive: () => api.get('/gym/membership_plans/active'),
  getById: (id) => api.get(`/gym/membership_plans/${id}`),
  create: (data) => api.post('/gym/membership_plans/create', data),
  update: (id, data) => api.put(`/gym/membership_plans/${id}`, data),
  delete: (id) => api.delete(`/gym/membership_plans/${id}`),
};

// ─────────────────────────────────────────────────────────
// MEMBERSHIPS  /gym/memberships
// ─────────────────────────────────────────────────────────
export const membershipsAPI = {
  assign: (data) => api.post('/gym/memberships/assign', data),
  getByMember: (memberId) => api.get(`/gym/memberships/member/${memberId}`),
  getAll: () => api.get('/gym/memberships/all'),
  cancel: (id) => api.put(`/gym/memberships/${id}/cancel`),
};

// ─────────────────────────────────────────────────────────
// PAYMENTS  /gym/payments
// ─────────────────────────────────────────────────────────
export const paymentsAPI = {
  create: (data) => api.post('/gym/payments/create_record', data),
  getSummary: () => api.get('/gym/payments/summary'),
  getAll: (params) => api.get('/gym/payments/all_payments', { params }),
  getByMember: (userId) => api.get(`/gym/payments/member/${userId}`),
  getOverdue: () => api.get('/gym/payments/overdue'),
  getDailyRevenue: () => api.get('/gym/payments/revenue/daily'),
  getPendingAmount: () => api.get('/gym/payments/revenue/pending'),
};

// ─────────────────────────────────────────────────────────
// ATTENDANCE  /api/gyms/{gymId}/attendance
// ─────────────────────────────────────────────────────────
export const attendanceAPI = {
  checkIn: (gymId, userId, data) =>
    api.post(`/api/gyms/${gymId}/attendance/check-in/${userId}`, data),
  checkOut: (gymId, userId) =>
    api.post(`/api/gyms/${gymId}/attendance/check-out/${userId}`),
  getCurrent: (gymId, userId) =>
    api.get(`/api/gyms/${gymId}/attendance/current/${userId}`),
  getToday: (gymId, userId) =>
    api.get(`/api/gyms/${gymId}/attendance/today/${userId}`),
};

// ─────────────────────────────────────────────────────────
// GYMS  /gym/gyms
// ─────────────────────────────────────────────────────────
export const gymsAPI = {
  getAll: () => api.get('/gym/gyms/all'),
  getActive: () => api.get('/gym/gyms/active'),
  getById: (id) => api.get(`/gym/gyms/${id}`),
  create: (data) => api.post('/gym/gyms/create', data),
  update: (id, data) => api.put(`/gym/gyms/${id}`, data),
  delete: (id) => api.delete(`/gym/gyms/${id}`),
};

// ─────────────────────────────────────────────────────────
// USERS  /gym/users
// ─────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: () => api.get('/gym/users/all'),
  search: (searchTerm) => api.get('/gym/users/search', { params: { searchTerm } }),
};

// ─────────────────────────────────────────────────────────
// PROGRESS  /gym/progress
// ─────────────────────────────────────────────────────────
export const progressAPI = {
  getByMember: (memberId) => api.get(`/gym/progress/member/${memberId}`),
  add: (data) => api.post('/gym/progress/add', data),
};

export default api;
