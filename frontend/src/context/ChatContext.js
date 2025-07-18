import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import socketService from '../services/socket';
import { messagesService } from '../services/api';
import { useAuth } from './AuthContext';

// Création du contexte
const ChatContext = createContext(null);

// Hook personnalisé pour utiliser le contexte de chat
export const useChat = () => useContext(ChatContext);

// Provider du contexte de chat
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Fonction pour charger l'historique des messages via l'API REST
  // Utile comme fallback si l'historique ne vient pas via socket
  const loadMessages = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const { data } = await messagesService.getMessages();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initialisation du chat quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated) {
      // On n'a plus besoin de charger l'historique via REST API
      // car nous allons recevoir l'historique via socket.io
      // loadMessages();

      // Configurer les gestionnaires d'événements Socket.IO
      socketService.onMessage((message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      
      // Gestionnaire pour recevoir l'historique des messages
      socketService.onMessageHistory((historyMessages) => {
        console.log(`Received ${historyMessages.length} messages from history`);
        setMessages(historyMessages);
        setLoading(false);
      });

      socketService.onConnect(() => {
        console.log('Connected to chat');
        // Le serveur enverra automatiquement l'historique des messages
      });

      socketService.onDisconnect((reason) => {
        console.log(`Disconnected from chat: ${reason}`);
        // Gérer la déconnexion ici
      });

      // Événements pour les connexions/déconnexions d'utilisateurs
      const handleUserConnected = (data) => {
        setOnlineUsers((prevUsers) => {
          if (!prevUsers.some(u => u.userId === data.userId)) {
            return [...prevUsers, { userId: data.userId, username: data.username }];
          }
          return prevUsers;
        });
      };

      const handleUserDisconnected = (data) => {
        setOnlineUsers((prevUsers) => 
          prevUsers.filter(user => user.userId !== data.userId)
        );
      };

      // Écouter les événements de connexion/déconnexion des utilisateurs
      socketService.socket.on('user_connected', handleUserConnected);
      socketService.socket.on('user_disconnected', handleUserDisconnected);

      return () => {
        // Nettoyage des écouteurs d'événements
        if (socketService.socket) {
          socketService.socket.off('user_connected', handleUserConnected);
          socketService.socket.off('user_disconnected', handleUserDisconnected);
        }
      };
    }
  }, [isAuthenticated, loadMessages]);

  // Fonction pour envoyer un message
  const sendMessage = (text) => {
    if (!isAuthenticated || !text.trim()) return false;
    
    return socketService.sendMessage(text);
  };

  // Valeurs exposées par le contexte
  const value = {
    messages,
    onlineUsers,
    loading,
    error,
    sendMessage,
    loadMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
