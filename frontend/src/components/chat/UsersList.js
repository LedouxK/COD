import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';

/**
 * Composant pour afficher la liste des utilisateurs connectés
 */
const UsersList = () => {
  const { onlineUsers } = useChat();
  const { user } = useAuth();

  return (
    <Card className="bg-white dark:bg-slate-900 shadow-md overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Utilisateurs en ligne ({onlineUsers.length})
        </h3>
      </div>
      
      {onlineUsers.length === 0 ? (
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
          <p>Aucun autre utilisateur connecté</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {/* Afficher l'utilisateur courant en premier avec un badge */}
          <li className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{user?.username || 'Vous'}</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Vous
            </span>
          </li>
          
          {/* Afficher les autres utilisateurs connectés */}
          {onlineUsers
            .filter(onlineUser => onlineUser.userId !== user?.id)
            .map((onlineUser) => (
              <li key={onlineUser.userId} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 dark:bg-green-600 text-white flex items-center justify-center font-medium">
                    {onlineUser.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{onlineUser.username}</div>
                </div>
                <div className="h-3 w-3 bg-green-400 rounded-full ring-2 ring-white dark:ring-slate-900"></div>
              </li>
            ))}
        </ul>
      )}
    </Card>
  );
};

export default UsersList;
