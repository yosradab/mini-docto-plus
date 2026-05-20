const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Veuillez ajouter un nom complet'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Veuillez ajouter un email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez ajouter un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Veuillez ajouter un mot de passe'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['patient', 'pro'],
    required: true
  },
  // Spécifique aux Professionnels (pro)
  specialty: {
    type: String,
    trim: true,
    required: function() { return this.role === 'pro'; }
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: function() {
      // Générer un score aléatoire ou par défaut pour le pro à la création, représentant sa pertinence
      return this.role === 'pro' ? Math.floor(Math.random() * 41) + 60 : undefined; // Entre 60 et 100
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Chiffrer le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour vérifier le mot de passe
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
