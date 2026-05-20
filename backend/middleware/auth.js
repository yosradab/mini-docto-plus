const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protéger les routes - Vérifier le token JWT
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé. Aucun jeton (token) fourni.'
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'doctoplus_secret_key_2026');

    // Récupérer l'utilisateur
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expirée ou jeton invalide.'
    });
  }
};

// Autoriser certains rôles ('patient', 'pro')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle '${req.user.role}' n'est pas autorisé à accéder à cette ressource.`
      });
    }
    next();
  };
};
