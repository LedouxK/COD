/**
 * Utilitaires pour gérer les tokens JWT
 */

// Stocke le token JWT dans le localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Récupère le token JWT du localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Supprime le token JWT du localStorage (déconnexion)
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Vérifie si un token est présent
export const hasToken = () => {
  return !!getToken();
};

// Extrait les informations du token JWT sans validation côté serveur
// Note: Pour une validation complète, utiliser l'API backend
export const parseToken = (token = getToken()) => {
  if (!token) return null;
  
  try {
    // Le token JWT est divisé en 3 parties: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur lors du parsing du token JWT:', error);
    return null;
  }
};
