const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  pro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Veuillez spécifier une date (format YYYY-MM-DD)']
  },
  startTime: {
    type: String, // Format: HH:MM
    required: [true, 'Veuillez spécifier une heure de début (format HH:MM)']
  },
  endTime: {
    type: String, // Format: HH:MM
    required: [true, 'Veuillez spécifier une heure de fin (format HH:MM)']
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Empêcher les doublons de créneaux pour le même professionnel au même horaire
SlotSchema.index({ pro: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', SlotSchema);
