const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token requis.' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré.' });
    }
    req.user = user;
    next();
  });
};

/**
 * @route   GET /api/messages
 * @desc    Récupérer l'historique des messages (avec pagination)
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Message.countDocuments();
    
    res.json({
      messages,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/**
 * @route   GET /api/messages/search
 * @desc    Recherche de messages
 * @access  Private
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, username, limit = 20 } = req.query;
    
    let searchConditions = {};
    
    if (query) {
      searchConditions.text = { $regex: query, $options: 'i' };
    }
    
    if (username) {
      searchConditions.username = { $regex: username, $options: 'i' };
    }
    
    const messages = await Message.find(searchConditions)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ messages });
  } catch (error) {
    console.error('Erreur lors de la recherche de messages:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/**
 * @route   GET /api/messages/user/:userId
 * @desc    Récupérer les messages d'un utilisateur spécifique
 * @access  Private
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const messages = await Message.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ messages });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
