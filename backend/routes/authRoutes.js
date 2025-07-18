const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

/**
 * Routes d'authentification
 */

// Route d'inscription
router.post('/register', authController.register);

// Route de connexion
router.post('/login', authController.login);

// Route pour obtenir les informations de l'utilisateur connecté
router.get('/user', authenticateToken, authController.getUser);

// Route pour valider un token JWT
router.get('/validate-token', authenticateToken, authController.validateToken);

module.exports = router;
