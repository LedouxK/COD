const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/messages
 * @desc    Récupérer les messages avec pagination
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('user'); // ← important pour les tests

    res.status(200).json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/**
 * @route   POST /api/messages
 * @desc    Créer un nouveau message
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Le contenu du message est requis.' });
    }

    const newMessage = await Message.create({
      content,
      user: req.user.userId || req.user.id // Utiliser userId ou id selon ce qui est disponible
    });

    const populated = await newMessage.populate('user');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/**
 * @route   GET /api/messages/search
 * @desc    Rechercher des messages par contenu
 * @access  Private
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Le paramètre de recherche est requis.' });
    }

    const messages = await Message.find({ 
      content: { $regex: query, $options: 'i' } 
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('user');

    res.json(messages);
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

    const messages = await Message.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('user');

    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
