import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UsersList from './UsersList';
import { useChat } from '../../context/ChatContext';

/**
 * Composant principal du chat qui contient tous les éléments
 * - Liste des messages
 * - Liste des utilisateurs
 * - Champ de saisie de message
 */
const ChatContainer = () => {
  const { loading, error } = useChat();

  // Afficher un loader pendant le chargement des messages
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du chat...</p>
      </div>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">
          {error}
        </p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-main">
        {/* Colonne gauche avec la liste des utilisateurs en ligne */}
        <div className="chat-sidebar">
          <UsersList />
        </div>
        
        {/* Colonne principale avec les messages et l'input */}
        <div className="chat-messages-container">
          <MessageList />
          <MessageInput />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
