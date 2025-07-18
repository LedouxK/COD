import React from 'react';

/**
 * Composant Footer pour l'application
 * - Affiche les informations de copyright et les liens utiles
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="text-slate-600 dark:text-slate-400 mb-4 sm:mb-0">
            &copy; {currentYear} Chat Temps Réel - Tous droits réservés
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">À propos</a>
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
