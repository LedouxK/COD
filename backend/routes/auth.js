const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false, message: 'Accès refusé. Token requis.' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ valid: false, message: 'Token invalide ou expiré.' });
    }
    req.user = user;
    next();
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Cet email est déjà utilisé.' 
      });
    }
    
    // Créer un nouvel utilisateur
    const newUser = new User({ email, password });
    await newUser.save();
    
    // Générer un token JWT
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      userId: newUser._id,
      email: newUser.email,
      username: newUser.email.split('@')[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'inscription.' 
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé.' 
      });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Mot de passe incorrect.' 
      });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Connexion réussie',
      token,
      userId: user._id,
      email: user.email,
      username: user.email.split('@')[0]
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la connexion.' 
    });
  }
});

/**
 * @route   GET /api/auth/user
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/**
 * @route   GET /api/auth/validate-token
 * @desc    Valider un token JWT
 * @access  Public
 */
router.get('/validate-token', authenticateToken, (req, res) => {
  // Si on arrive ici, c'est que le middleware authenticateToken a vérifié le token avec succès
  res.json({
    valid: true,
    user: {
      id: req.user.userId,
      email: req.user.email
    }
  });
});

module.exports = router;
