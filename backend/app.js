require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Routes (architecture MVC)
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
// Garder la référence aux routes externes si elles existent
const externalRoutes = require('./routes/external');

// Création de l'application Express
const app = express();

// Middleware
// Configuration CORS dynamique qui n'accepte que les origines spécifiées
const allowedOrigins = [ "http://localhost:3000", "http://localhost:3001" ];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Log pour déboguer
app.use((req, res, next) => {
  console.log(`Requête reçue: ${req.method} ${req.url} de l'origine ${req.headers.origin}`);
  next();
});
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/external', externalRoutes);

// Servir les fichiers statiques du frontend (build React)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Route catch-all pour servir l'application React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Connexion MongoDB seulement si pas déjà connecté (pour les tests)
if (mongoose.connection.readyState === 0) {
  const mongoURI = process.env.NODE_ENV === 'test' 
    ? (process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/chat_test')
    : process.env.MONGO_URI;

  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
}

module.exports = app;
