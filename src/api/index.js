import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ===== AXIOS INSTANCE =====
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ===== REQUEST INTERCEPTOR =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR =====
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/gym/auth/refresh`, null, {
            params: { refreshToken },
          });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const authAPI = {
  login: (data) => api.post('/gym/auth/login', data),
  register: (data) => api.post('/gym/auth/register', data),
  logout: (token) => api.post('/gym/auth/logout', null, { params: { token } }),
  refreshToken: (refreshToken) => api.post('/gym/auth/refresh', null, { params: { refreshToken } }),
};

// ===== MEMBER API =====
export const memberAPI = {
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

// ===== TRAINER API =====
export const trainerAPI = {
  getAll: (params) => api.get('/gym/trainers', { params }),
  getActive: () => api.get('/gym/trainers/active'),
  getById: (id) => api.get(`/gym/trainers/${id}`),
  getBySpecialization: (spec) => api.get(`/gym/trainers/specialization/${spec}`),
  getTopRated: () => api.get('/gym/trainers/top-rated'),
  create: (data) => api.post('/gym/trainers', data),
  update: (id, data) => api.put(`/gym/trainers/${id}`, data),
  delete: (id) => api.delete(`/gym/trainers/${id}`),
};

// ===== MEMBERSHIP PLAN API =====
export const membershipPlanAPI = {
  getAll: () => api.get('/gym/membership_plans/all'),
  getActive: () => api.get('/gym/membership_plans/active'),
  getById: (id) => api.get(`/gym/membership_plans/${id}`),
  create: (data) => api.post('/gym/membership_plans/create', data),
  update: (id, data) => api.put(`/gym/membership_plans/${id}`, data),
  delete: (id) => api.delete(`/gym/membership_plans/${id}`),
};

// ===== MEMBER MEMBERSHIP API =====
export const membershipAPI = {
  getAll: () => api.get('/gym/memberships'),
  getById: (id) => api.get(`/gym/memberships/${id}`),
  getByMember: (memberId) => api.get(`/gym/memberships/member/${memberId}`),
  assign: (data) => api.post('/gym/memberships/assign', data),
  update: (id, data) => api.put(`/gym/memberships/${id}`, data),
  cancel: (id) => api.put(`/gym/memberships/${id}/cancel`),
};

// ===== PAYMENT API =====
export const paymentAPI = {
  create: (data) => api.post('/gym/payments/create_record', data),
  getSummary: () => api.get('/gym/payments/summary'),
  getAll: (params) => api.get('/gym/payments/all_payments', { params }),
  getMemberPayments: (userId) => api.get(`/gym/payments/member/${userId}`),
  getOverdue: () => api.get('/gym/payments/overdue'),
  getDailyRevenue: () => api.get('/gym/payments/revenue/daily'),
  getPendingAmount: () => api.get('/gym/payments/revenue/pending'),
};

// ===== ATTENDANCE API =====
export const attendanceAPI = {
  checkIn: (gymId, userId, data) => api.post(`/api/gyms/${gymId}/attendance/check-in/${userId}`, data),
  checkOut: (gymId, userId) => api.post(`/api/gyms/${gymId}/attendance/check-out/${userId}`),
  getCurrent: (gymId, userId) => api.get(`/api/gyms/${gymId}/attendance/current/${userId}`),
  getToday: (gymId, userId) => api.get(`/api/gyms/${gymId}/attendance/today/${userId}`),
  getTodayList: (gymId, page, size) => api.get(`/api/gyms/${gymId}/attendance/today/list`, { 
    params: { page, size } 
  }),
  getCurrentlyPresent: (gymId) => api.get(`/api/gyms/${gymId}/attendance/currently-present`),
  getStatistics: (gymId, date) => api.get(`/api/gyms/${gymId}/attendance/statistics`, { 
    params: { date: date || undefined } 
  }),
  getWeekly: (gymId) => api.get(`/api/gyms/${gymId}/attendance/weekly`),
  getByDateRange: (gymId, startDate, endDate, page, size) => api.get(`/api/gyms/${gymId}/attendance/date-range`, {
    params: { startDate, endDate, page, size }
  }),
};

// ===== GYM API =====
export const gymAPI = {
  getAll: (params) => api.get('/gym/gyms/all', { params }),
  getActive: () => api.get('/gym/gyms/active'),
  getById: (id) => api.get(`/gym/gyms/${id}`),
  create: (data) => api.post('/gym/gyms/create', data),
  update: (id, data) => api.put(`/gym/gyms/${id}`, data),
  delete: (id) => api.delete(`/gym/gyms/${id}`),
};

// ===== STORE API =====
export const storeAPI = {
  // Categories
  getCategories: (gymId) => api.get(`/gym/store/categories?gymId=${gymId}`),
  createCategory: (data) => api.post('/gym/store/categories', data),
  
  // Products
  getProducts: (gymId, categoryId, page, size) => api.get('/gym/store/products', {
    params: { gymId, categoryId, page, size }
  }),
  getProduct: (id) => api.get(`/gym/store/products/${id}`),
  createProduct: (data) => api.post('/gym/store/products', data),
  updateProduct: (id, data) => api.put(`/gym/store/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/gym/store/products/${id}`),
  searchProducts: (gymId, searchTerm, page, size) => api.get('/gym/store/products/search', {
    params: { gymId, searchTerm, page, size }
  }),
  getLowStockProducts: (gymId) => api.get(`/gym/store/alerts/low-stock?gymId=${gymId}`),
  
  // Cart
  getCart: (userId) => api.get(`/gym/store/cart?userId=${userId}`),
  addToCart: (userId, productId, quantity) => api.post('/gym/store/cart/add', null, {
    params: { userId, productId, quantity }
  }),
  updateCartItem: (userId, productId, quantity) => api.put('/gym/store/cart/update', null, {
    params: { userId, productId, quantity }
  }),
  removeFromCart: (userId, productId) => api.delete('/gym/store/cart/remove', {
    params: { userId, productId }
  }),
  clearCart: (userId) => api.post('/gym/store/cart/clear', null, {
    params: { userId }
  }),
  checkout: (userId, checkoutData) => api.post('/gym/store/cart/checkout', checkoutData, {
    params: { userId }
  }),
  
  // Orders
  getOrders: (gymId, page, size) => api.get('/gym/store/orders', {
    params: { gymId, page, size }
  }),
  getOrder: (id) => api.get(`/gym/store/orders/${id}`),
  createOrder: (data) => api.post('/gym/store/orders', data),
  updateOrderStatus: (id, status) => api.put(`/gym/store/orders/${id}/status`, null, {
    params: { status }
  }),
  getMyOrders: (userId, page, size) => api.get('/gym/store/orders/my-orders', {
    params: { userId, page, size }
  }),
  
  // Statistics
  getStatistics: (gymId, startDate, endDate) => api.get('/gym/store/statistics', {
    params: { gymId, startDate, endDate }
  }),
};

// ===== USER API =====
export const userAPI = {
  search: (searchTerm) => api.get('/gym/users/search', { params: { searchTerm } }),
  getAll: () => api.get('/gym/users/all'),
};

export default api;
