const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Importer l'application Express depuis app.js
const app = require('./app');

// Créer le serveur HTTP et Socket.IO
const server = http.createServer(app);
// Configuration CORS spécifique pour le développement
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],  // Autorise seulement les origines spécifiées
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    
    socket.userId = decoded.userId;
    socket.username = decoded.email.split('@')[0]; // Use email username as display name
    next();
  });
});

// Socket.IO connection
io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.username} (${socket.userId})`);
  
  // Récupérer l'historique des messages depuis la base de données
  try {
    const Message = require('./models/Message');
    const messages = await Message.find()
      .sort({ createdAt: 1 })
      .limit(50)
      .populate('user', 'email')
      .lean();
    
    // Transformer les messages pour les rendre compatibles avec le frontend
    const formattedMessages = messages.map(msg => ({
      ...msg,
      username: msg.user && typeof msg.user === 'object' && msg.user.email ? 
               msg.user.email.split('@')[0] : 
               (msg.isSystemMessage ? 'System' : 'Unknown')
    }));
    
    // Envoyer l'historique des messages uniquement à l'utilisateur qui vient de se connecter
    socket.emit('message_history', formattedMessages);
    
    console.log(`Sent message history (${formattedMessages.length} messages) to user: ${socket.username}`);
  } catch (error) {
    console.error('Error retrieving message history:', error);
    socket.emit('error', { message: 'Error retrieving chat history' });
  }
  
  // Notify all users about new connection
  io.emit('user_connected', {
    userId: socket.userId,
    username: socket.username,
    message: `${socket.username} has joined the chat`
  });
  
  // Handle chat messages
  socket.on('send_message', async (messageData) => {
    try {
      const Message = require('./models/Message');
      
      // Special commands handling
      if (messageData.text.startsWith('!')) {
        const command = messageData.text.split(' ')[0].substring(1);
        const query = messageData.text.substring(command.length + 2);
        
        if (command === 'weather' || command === 'pokemon') {
          try {
            const axios = require('axios');
            const response = await axios.post(`http://localhost:${process.env.PORT}/api/external/${command}`, {
              query,
              userId: socket.userId
            });
            
            // Create and save command response as a system message
            const systemMessage = new Message({
              content: response.data.message,
              user: 'system',  // Pour les messages système, on utilise une chaîne au lieu d'un ObjectId
              isSystemMessage: true
            });
            
            await systemMessage.save();
            io.emit('receive_message', systemMessage);
            return;
          } catch (error) {
            console.error(`Error processing ${command} command:`, error);
            
            // Send error message to user
            const errorMessage = new Message({
              content: `Error processing ${command} command. Please try again later.`,
              user: 'system',
              isSystemMessage: true,
              createdAt: new Date()
            });
            
            // Pas besoin de sauvegarder les messages d'erreur dans la BD
            socket.emit('receive_message', {
              ...errorMessage.toObject(),
              username: 'System'
            });
          }
        }
      }
      
      // Regular message handling
      const message = new Message({
        content: messageData.text,
        user: socket.userId
      });
      
      await message.save();
      // Pour garder la compatibilité avec le frontend, on envoie le message avec les infos supplémentaires
      io.emit('receive_message', { 
        ...message.toObject(), 
        username: socket.username 
      });
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Error processing your message' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.username} (${socket.userId})`);
    io.emit('user_disconnected', {
      userId: socket.userId,
      username: socket.username,
      message: `${socket.username} has left the chat`
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
