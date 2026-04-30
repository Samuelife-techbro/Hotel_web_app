import axios from 'axios';

const API_BASE = 'https://hotel-web-app-9keh.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(API_BASE + '/auth/refresh/', { refresh });
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = 'Bearer ' + data.access;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  me: () => api.get('/auth/me/'),
};

export const roomsApi = {
  list: (params) => api.get('/rooms/', { params }),
  get: (id) => api.get('/rooms/' + id + '/'),
  available: (params) => api.get('/rooms/available_rooms/', { params }),
  checkAvailability: (id, checkIn, checkOut) =>
    api.get('/rooms/' + id + '/availability/', { params: { check_in: checkIn, check_out: checkOut } }),
  create: (data) =>
    api.post('/rooms/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  update: (id, data) =>
    api.patch('/rooms/' + id + '/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  delete: (id) => api.delete('/rooms/' + id + '/'),
};

export const bookingsApi = {
  list: (params) => api.get('/bookings/', { params }),
  get: (id) => api.get('/bookings/' + id + '/'),
  create: (data) => api.post('/bookings/', data),
  update: (id, data) => api.patch('/bookings/' + id + '/', data),
  updateStatus: (id, status) => api.patch('/bookings/' + id + '/update_status/', { status }),
  delete: (id) => api.delete('/bookings/' + id + '/'),
  exportCSV: (filter: any) => api.get('/bookings/export_csv/', { params: { filter }, responseType: 'blob' }),
  stats: (filter: any) => api.get('/bookings/stats/', { params: { filter } }),
};

export const inventoryApi = {
  listItems: () => api.get('/inventory/items/'),
  getItem: (id: any) => api.get('/inventory/items/' + id + '/'),
  createItem: (data) => api.post('/inventory/items/', data),
  updateItem: (id, data) => api.patch('/inventory/items/' + id + '/', data),
  deleteItem: (id) => api.delete('/inventory/items/' + id + '/'),
  exportCSV: () => api.get('/inventory/items/export_csv/', { responseType: 'blob' }),
  listRoomItems: (params) => api.get('/inventory/room-items/', { params }),
  createRoomItem: (data) => api.post('/inventory/room-items/', data),
  updateRoomItem: (id, data) => api.patch('/inventory/room-items/' + id + '/', data),
  deleteRoomItem: (id: any) => api.delete('/inventory/room-items/' + id + '/'),
};

export const notificationsApi = {
  list: () => api.get('/notifications/'),
  unreadCount: () => api.get('/notifications/unread_count/'),
  markRead: (id: any) => api.patch('/notifications/' + id + '/mark_read/'),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats/'),
};
