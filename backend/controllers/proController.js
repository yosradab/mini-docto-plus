const Slot = require('../models/Slot');
const Appointment = require('../models/Appointment');

// @desc    Ajouter un créneau de disponibilité
// @route   POST /api/pros/slots
// @access  Privé (Professionnel uniquement)
exports.addSlot = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez renseigner la date, l\'heure de début et l\'heure de fin.'
      });
    }

    // Créer le créneau
    const slot = await Slot.create({
      pro: req.user.id,
      date,
      startTime,
      endTime
    });

    res.status(201).json({
      success: true,
      message: 'Créneau ajouté avec succès !',
      slot
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ce créneau existe déjà dans vos disponibilités.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du créneau.',
      error: error.message
    });
  }
};

// @desc    Supprimer un créneau de disponibilité
// @route   DELETE /api/pros/slots/:slotId
// @access  Privé (Professionnel uniquement)
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Créneau introuvable.'
      });
    }

    // S'assurer que le créneau appartient à ce professionnel
    if (slot.pro.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce créneau.'
      });
    }

    // Si le créneau est déjà réservé
    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un créneau déjà réservé par un patient. Veuillez d\'abord annuler le rendez-vous.'
      });
    }

    await slot.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Créneau de disponibilité supprimé.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du créneau.',
      error: error.message
    });
  }
};

// @desc    Consulter la liste de ses créneaux
// @route   GET /api/pros/slots
// @access  Privé (Professionnel uniquement)
exports.getProSlots = async (req, res) => {
  try {
    const slots = await Slot.find({ pro: req.user.id }).sort({ date: 1, startTime: 1 });
    res.status(200).json({
      success: true,
      count: slots.length,
      slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des créneaux.',
      error: error.message
    });
  }
};

// @desc    Consulter la liste des rendez-vous réservés par les patients
// @route   GET /api/pros/appointments
// @access  Privé (Professionnel uniquement)
exports.getProAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ pro: req.user.id, status: 'confirmed' })
      .populate('patient', 'name email')
      .populate('slot', 'date startTime endTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous.',
      error: error.message
    });
  }
};
