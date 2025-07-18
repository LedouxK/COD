const Message = require('../models/Message');


/**
 * Contrôleur pour créer un nouveau message
 * @route   POST /api/messages
 * @access  Private
 */
const createMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Le contenu du message est requis.' });
    }
    
    // Vérifions que req.user existe bien
    if (!req.user || !req.user.id) {
      console.error('createMessage: req.user est absent ou invalide', req.user);
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }
    
    // Création du message avec le nouveau schéma
    const newMessage = new Message({
      content: content,
      user: req.user.id // Référence à l'utilisateur (ObjectId)
    });
    
    await newMessage.save();
    
    // Peupler le champ 'user' pour la réponse
    const populatedMessage = await Message.findById(newMessage._id).populate('user');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/**
 * Contrôleur pour récupérer l'historique des messages (avec pagination)
 * @route   GET /api/messages
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    // Transformer les messages pour correspondre au format attendu par les tests
    const formattedMessages = messages.map(formatMessageForResponse);
    
    // Retourner directement le tableau de messages
    res.json(formattedMessages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/**
 * Contrôleur pour rechercher des messages
 * @route   GET /api/messages/search
 * @access  Private
 */
const searchMessages = async (req, res) => {
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
    
    // Transformer les messages pour correspondre au format attendu par les tests
    const formattedMessages = messages.map(formatMessageForResponse);
    
    // Retourner directement le tableau de messages
    res.json(formattedMessages);
  } catch (error) {
    console.error('Erreur lors de la recherche de messages:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/**
 * Contrôleur pour récupérer les messages d'un utilisateur spécifique
 * @route   GET /api/messages/user/:userId
 * @access  Private
 */
const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const messages = await Message.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Transformer les messages pour correspondre au format attendu par les tests
    const formattedMessages = messages.map(formatMessageForResponse);
    
    // Retourner directement le tableau de messages
    res.json(formattedMessages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  createMessage,
  getMessages,
  searchMessages,
  getUserMessages
};
