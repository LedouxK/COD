import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * Composant pour la saisie et l'envoi de messages
 * - Gère aussi les commandes spéciales (!weather, !pokemon)
 */
const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsSending(true);
    
    // Envoi du message via le service Socket.IO
    const success = sendMessage(message.trim());
    
    if (success) {
      setMessage(''); // Réinitialiser le champ de saisie après envoi
    } else {
      // Afficher une erreur temporaire si l'envoi échoue
      console.error('Erreur lors de l\'envoi du message');
    }
    
    setIsSending(false);
  };

  return (
    <form 
      className="flex w-full space-x-2 p-2 bg-white rounded-md shadow-sm dark:bg-slate-900" 
      onSubmit={handleSubmit}
    >
      <div className="flex-grow">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tapez votre message ici... (essayez !weather Paris ou !pokemon pikachu)"
          disabled={isSending}
          className="w-full"
        />
      </div>
      <Button 
        type="submit" 
        disabled={!message.trim() || isSending}
        className="flex items-center gap-2"
      >
        <span>Envoyer</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
        </svg>
      </Button>
    </form>
  );
};

export default MessageInput;
