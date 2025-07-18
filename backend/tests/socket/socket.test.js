const request = require('supertest');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');
const app = require('../../app');

// Variables pour les tests
let httpServer, io, clientSocket, authToken, port;
const testUser = {
  email: 'socket-test@example.com',
  password: 'Password123!',
  username: 'socketuser'
};

// Configuration avant tous les tests
beforeAll(async () => {
  // Vérifier si une connexion MongoDB existe déjà
  if (mongoose.connection.readyState === 0) {
    // Aucune connexion active, on se connecte à la base de test
    const mongoURI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/chat_test';
    await mongoose.connect(mongoURI);
  } else if (mongoose.connection.readyState === 1) {
    // Une connexion existe déjà, on réinitialise la base de données
    await mongoose.connection.dropDatabase();
  }
  
  // Enregistrer un utilisateur et récupérer le token
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send(testUser);
  
  authToken = registerRes.body.token;
  
  // Créer un serveur HTTP de test pour Socket.IO avec un port dynamique
  httpServer = createServer(app); // Utilise l'app Express
  io = new Server(httpServer);
  
  // Configuration de l'authentification Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Invalid token'));
      socket.userId = decoded.userId;
      socket.username = decoded.email.split('@')[0];
      next();
    });
  });

  // Configuration de la gestion des messages
  io.on('connection', (socket) => {
    // Notifier tout le monde de la connexion
    io.emit('user_connected', {
      userId: socket.userId,
      username: socket.username,
      message: `${socket.username} has joined the chat`
    });

    // Gérer les messages envoyés
    socket.on('send_message', (data) => {
      const message = {
        id: Math.random().toString(36).substr(2, 9),
        content: data.content,
        user: {
          _id: socket.userId,
          username: socket.username
        },
        createdAt: new Date()
      };
      
      // Émettre le message à tous les clients
      io.emit('receive_message', message);
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
      io.emit('user_disconnected', {
        userId: socket.userId,
        username: socket.username,
        message: `${socket.username} has left the chat`
      });
    });
  });

  // Démarrer le serveur de test et récupérer le port dynamique attribué
  await new Promise(resolve => {
    httpServer.listen(0, () => {
      port = httpServer.address().port; // Récupérer le port réellement attribué
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });
});

// Nettoyage après tous les tests
afterAll(async () => {
  // Fermer la connexion client si elle existe
  if (clientSocket) {
    clientSocket.close();
  }
  
  // Fermer le serveur HTTP s'il existe
  if (httpServer) {
    await new Promise((resolve) => {
      httpServer.close(() => {
        resolve();
      });
    });
  }
  
  // Nettoyer la base de données et fermer la connexion
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Configuration avant chaque test
beforeEach((done) => {
  // Créer un client Socket.IO pour les tests
  clientSocket = Client(`http://localhost:${port}`, {
    auth: { token: authToken },
    transports: ['websocket']
  });
  
  // Timeout de sécurité pour éviter les blocages
  const timeout = setTimeout(() => {
    done(new Error('Connection timeout after 5 seconds'));
  }, 5000);
  
  clientSocket.on('connect', () => {
    clearTimeout(timeout);
    done();
  });
  
  clientSocket.on('connect_error', (err) => {
    clearTimeout(timeout);
    console.error('Connection error:', err);
    done(err);
  });
});

// Nettoyage après chaque test
afterEach(() => {
  if (clientSocket) {
    clientSocket.close();
  }
});

describe('Socket.IO Communication', () => {
  test('should connect with valid authentication', (done) => {
    const timeout = setTimeout(() => {
      done(new Error('Test timeout after 5 seconds'));
    }, 5000);
    
    if (clientSocket.connected) {
      clearTimeout(timeout);
      expect(clientSocket.connected).toBeTruthy();
      done();
    } else {
      clientSocket.on('connect', () => {
        clearTimeout(timeout);
        expect(clientSocket.connected).toBeTruthy();
        done();
      });
    }
  });

  test('should receive own message after sending', (done) => {
    const testMessage = { content: 'Test message ' + Date.now() };
    const timeout = setTimeout(() => {
      done(new Error('Test timeout after 5 seconds'));
    }, 5000);

    clientSocket.on('receive_message', (message) => {
      if (message.content === testMessage.content) {
        clearTimeout(timeout);
        expect(message.content).toBe(testMessage.content);
        expect(message.user).toBeDefined();
        expect(message.createdAt).toBeDefined();
        done();
      }
    });

    clientSocket.emit('send_message', testMessage);
  });

  test('should notify when a user connects', (done) => {
    const timeout = setTimeout(() => {
      done(new Error('Test timeout after 5 seconds'));
    }, 5000);
    
    // Créer un second client
    const client2 = Client(`http://localhost:${port}`, {
      auth: { token: authToken },
      transports: ['websocket']
    });
    
    clientSocket.on('user_connected', (data) => {
      clearTimeout(timeout);
      expect(data.userId).toBeDefined();
      expect(data.username).toBeDefined();
      expect(data.message).toContain('joined');
      
      // Fermer le second client
      client2.disconnect();
      done();
    });
  });

  test('should notify when a user disconnects', (done) => {
    const timeout = setTimeout(() => {
      done(new Error('Test timeout after 5 seconds'));
    }, 5000);
    
    // Créer un second client
    const client2 = Client(`http://localhost:${port}`, {
      auth: { token: authToken },
      transports: ['websocket']
    });
    
    // Attendre la connexion avant de déconnecter
    client2.on('connect', () => {
      // Une fois connecté, on simule une déconnexion
      clientSocket.on('user_disconnected', (data) => {
        clearTimeout(timeout);
        expect(data.userId).toBeDefined();
        expect(data.username).toBeDefined();
        expect(data.message).toContain('left');
        done();
      });
      
      // Déconnecter le client
      client2.disconnect();
    });
  });
});
