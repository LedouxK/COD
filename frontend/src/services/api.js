import axios from 'axios';

// Détection de l'environnement - Docker vs développement local
const isInDocker = window.location.hostname === 'frontend' || window.location.hostname === 'localhost';

// En Docker, on utilise le nom du service 'api', sinon localhost
const apiBaseUrl = process.env.REACT_APP_API_URL || 
  (isInDocker && window.location.hostname !== 'localhost' ? 'http://api:3000/api' : 'http://localhost:3000/api');

console.log('API URL utilisée:', apiBaseUrl);

// Création d'une instance axios avec la configuration de base
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  validateToken: () => api.get('/auth/validate-token'),
  getCurrentUser: () => api.get('/auth/user'),
};

// Services de messages
export const messagesService = {
  getMessages: (limit = 50, offset = 0) => 
    api.get(`/messages?limit=${limit}&offset=${offset}`),
};

// Services pour les commandes externes
export const externalService = {
  getWeather: (query) => api.post('/external/weather', { query }),
  getPokemon: (query) => api.post('/external/pokemon', { query }),
};

export default api;
