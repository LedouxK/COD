import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { setToken, getToken, removeToken, parseToken } from '../utils/tokenUtils';
import socketService from '../services/socket';

// Création du contexte
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Valider le token avec le backend
          // Le token est automatiquement envoyé dans l'en-tête Authorization par l'intercepteur
          const { data } = await authService.validateToken();
          
          if (data.valid) {
            // Token valide, obtenir les informations de l'utilisateur
            const userResponse = await authService.getCurrentUser();
            setUser(userResponse.data);
            
            // Connecter le socket avec le token
            socketService.connect(token);
          } else {
            // Token invalide, déconnecter l'utilisateur
            removeToken();
            setUser(null);
          }
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
          removeToken();
          setError('Session expirée. Veuillez vous reconnecter.');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Fonction pour l'inscription d'un utilisateur
  const register = async (email, password, username) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authService.register({ email, password, username });
      setToken(data.token);
      setUser({
        id: data.userId,
        email: data.email,
        username: data.username
      });
      socketService.connect(data.token);
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour la connexion d'un utilisateur
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authService.login({ email, password });
      setToken(data.token);
      setUser({
        id: data.userId,
        email: data.email,
        username: data.username
      });
      socketService.connect(data.token);
      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError(error.response?.data?.message || 'Erreur lors de la connexion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour la déconnexion
  const logout = () => {
    removeToken();
    setUser(null);
    socketService.disconnect();
  };

  // Valeurs exposées par le contexte
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
