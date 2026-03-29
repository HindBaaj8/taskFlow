import axios from 'axios';

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });

  // Attach JWT to every request
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Global 401 handler — logout user
  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const authAPI    = createInstance(process.env.REACT_APP_AUTH_URL);
export const projectAPI = createInstance(process.env.REACT_APP_PROJECT_URL);
export const taskAPI    = createInstance(process.env.REACT_APP_TASK_URL);
export const collabAPI  = createInstance(process.env.REACT_APP_COLLAB_URL);
export const reportAPI  = createInstance(process.env.REACT_APP_REPORT_URL);
