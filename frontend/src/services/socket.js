import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.disconnectionHandlers = [];
    this.messageHistoryHandlers = [];  // Nouveau tableau pour les gestionnaires d'historique
  }

  // Initialisation de la connexion Socket.IO avec authentification par token JWT
  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Événements de base pour la connexion
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.connectionHandlers.forEach(handler => handler());
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`Disconnected from socket server: ${reason}`);
      this.disconnectionHandlers.forEach(handler => handler(reason));
    });

    // Écoute des messages entrants
    this.socket.on('receive_message', (message) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    // Écoute de l'historique des messages
    this.socket.on('message_history', (messages) => {
      console.log(`Received message history: ${messages.length} messages`);
      this.messageHistoryHandlers.forEach(handler => handler(messages));
    });

    // Écoute des notifications de connexion/déconnexion des utilisateurs
    this.socket.on('user_connected', (data) => {
      console.log(`User connected: ${data.username}`);
      // Notifier l'UI
    });

    this.socket.on('user_disconnected', (data) => {
      console.log(`User disconnected: ${data.username}`);
      // Notifier l'UI
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  // Envoi d'un message
  sendMessage(text) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected. Cannot send message.');
      return false;
    }
    this.socket.emit('send_message', { text });
    return true;
  }

  // Ajout d'un handler pour les messages
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  // Ajout d'un handler pour la connexion
  onConnect(handler) {
    this.connectionHandlers.push(handler);
  }

  // Ajout d'un handler pour la déconnexion
  onDisconnect(handler) {
    this.disconnectionHandlers.push(handler);
  }

  // Ajout d'un handler pour l'historique des messages
  onMessageHistory(handler) {
    this.messageHistoryHandlers.push(handler);
  }

  // Déconnexion
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Exportation d'une instance singleton
const socketService = new SocketService();
export default socketService;
