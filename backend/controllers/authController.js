const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Contrôleur pour gérer l'inscription d'un utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Cet email est déjà utilisé.' 
      });
    }
    
    // Créer un nouvel utilisateur
    const newUser = new User({ 
      email, 
      password,
      username: username || email.split('@')[0] // Utilise l'email comme username par défaut
    });
    
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
      username: newUser.username || newUser.email.split('@')[0]
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'inscription.' 
    });
  }
};

/**
 * Contrôleur pour gérer la connexion d'un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Identifiants invalides.' 
      });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Identifiants invalides.' 
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
      username: user.username || user.email.split('@')[0]
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la connexion.' 
    });
  }
};

/**
 * Contrôleur pour récupérer le profil de l'utilisateur connecté
 * @route   GET /api/auth/user
 * @access  Private
 */
const getUser = async (req, res) => {
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
};

/**
 * Contrôleur pour valider un token JWT
 * @route   GET /api/auth/validate-token
 * @access  Public
 */
const validateToken = (req, res) => {
  // Si on arrive ici, c'est que le middleware authenticateToken a vérifié le token avec succès
  res.json({
    valid: true,
    user: {
      id: req.user.userId,
      email: req.user.email
    }
  });
};

module.exports = {
  register,
  login,
  getUser,
  validateToken
};
