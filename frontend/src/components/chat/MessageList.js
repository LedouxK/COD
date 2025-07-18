import React, { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

/**
 * Composant pour afficher la liste des messages du chat
 * - Affiche les messages avec différenciation entre envoyés/reçus
 * - Fait défiler automatiquement vers le dernier message
 */
const MessageList = () => {
  const { messages } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Faire défiler automatiquement vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col space-y-3 p-4 overflow-y-auto max-h-[600px]">
      {messages.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-slate-500 dark:text-slate-400">Aucun message pour le moment. Commencez la conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          // Détermine le type de message (système, envoyé, reçu)
          const isSystemMessage = message.isSystemMessage;
          const isSentByUser = message.author?._id === user?.id;
          
          return (
            <div 
              key={message._id}
              className={cn(
                "flex",
                isSentByUser ? "justify-end" : "justify-start"
              )}
            >
              <Card 
                className={cn(
                  "max-w-[80%] shadow-sm",
                  isSystemMessage && "bg-slate-100 dark:bg-slate-800 w-full text-center",
                  isSentByUser && !isSystemMessage && "bg-blue-500 text-white dark:bg-blue-600",
                  !isSystemMessage && !isSentByUser && "bg-white dark:bg-slate-700"
                )}
              >
                <CardContent className="p-3 space-y-1">
                  {/* Afficher le nom de l'auteur seulement pour les messages reçus */}
                  {!isSystemMessage && !isSentByUser && (
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {message.author?.username}
                    </div>
                  )}
                  
                  {/* Contenu du message */}
                  <div className={cn(
                    "text-sm",
                    isSystemMessage && "italic"
                  )}>
                    {message.content || message.text}
                  </div>
                  
                  {/* Heure du message */}
                  <div className={cn(
                    "text-xs text-right",
                    isSentByUser && !isSystemMessage ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {formatDate(message.createdAt)}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })
      )}
      {/* Élément invisible pour faire défiler vers le bas */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
