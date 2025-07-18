const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  // Champ principal pour le contenu du message
  // Pour la compatibilité avec les tests qui attendent 'content'
  content: {
    type: String,
    required: true,
    trim: true
  },
  // Référence à l'utilisateur qui a créé le message
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Date de création automatique
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Pour les messages de commandes externes (comme !weather)
  isSystemMessage: {
    type: Boolean,
    default: false
  }
});

// Indexer pour les recherches rapides
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ user: 1 });

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
