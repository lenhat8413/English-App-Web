import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // đổi theo backend nếu cần
});

api.interceptors.request.use((config) => {
  const access = localStorage.getItem('accessToken');
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let isRefreshing = false;
let queue: Array<(t: string) => void> = [];

api.interceptors.response.use(
  resp => resp,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh');
          const { data } = await axios.post('http://localhost:4000/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          queue.forEach(cb => cb(data.accessToken));
          queue = [];
          return api(original);
        } catch (e) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }
      return new Promise((resolve) => {
        queue.push((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }
    return Promise.reject(error);
  }
);

export default api;
