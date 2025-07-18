const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier le token JWT
 * Retourne 401 si le token est absent ou invalide
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      valid: false, 
      message: 'Accès refusé. Token requis.' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ 
        valid: false, 
        message: 'Token invalide ou expiré.' 
      });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
