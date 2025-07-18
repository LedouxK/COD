import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

/**
 * Composant Header pour l'application
 * - Affiche le titre de l'application
 * - Affiche le nom d'utilisateur si connecté
 * - Permet la déconnexion
 */
const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-slate-950 shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo et titre */}
        <div>
          <Link to={isAuthenticated ? '/chat' : '/'} className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <h1 className="text-xl font-bold">Chat Temps Réel</h1>
          </Link>
        </div>

        {/* Navigation et profil utilisateur */}
        <div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-700 dark:text-slate-300">
                Bonjour, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.username}</span>
              </span>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="text-sm font-medium"
              >
                Déconnexion
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-sm">Connexion</Button>
              </Link>
              <Link to="/register">
                <Button variant="default" className="text-sm">Inscription</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
