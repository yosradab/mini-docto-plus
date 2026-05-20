const User = require('../models/User');
const Slot = require('../models/Slot');
const Appointment = require('../models/Appointment');

// @desc    Consulter la liste des professionnels disponibles, triés par score décroissant
// @route   GET /api/patients/pros
// @access  Privé (Patient uniquement)
exports.getProfessionals = async (req, res) => {
  try {
    // Récupérer tous les utilisateurs avec le rôle 'pro' triés par score décroissant (le plus grand en premier)
    const pros = await User.find({ role: 'pro' })
      .select('name email specialty bio score createdAt')
      .sort({ score: -1 });

    res.status(200).json({
      success: true,
      count: pros.length,
      professionals: pros
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des professionnels.',
      error: error.message
    });
  }
};

// @desc    Consulter les créneaux disponibles pour un professionnel spécifique
// @route   GET /api/patients/pros/:proId/slots
// @access  Privé (Patient uniquement)
exports.getProSlotsForPatient = async (req, res) => {
  try {
    const slots = await Slot.find({
      pro: req.params.proId,
      isBooked: false
    }).sort({ date: 1, startTime: 1 });

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

// @desc    Réserver un créneau (Créer un rendez-vous)
// @route   POST /api/patients/appointments
// @access  Privé (Patient uniquement)
exports.bookAppointment = async (req, res) => {
  try {
    const { slotId, notes } = req.body;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un identifiant de créneau (slotId).'
      });
    }

    // Récupérer le créneau
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Créneau introuvable.'
      });
    }

    // Vérifier si le créneau est déjà réservé
    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Ce créneau est déjà réservé.'
      });
    }

    // Créer le rendez-vous
    const appointment = await Appointment.create({
      patient: req.user.id,
      pro: slot.pro,
      slot: slotId,
      notes: notes || ''
    });

    // Mettre à jour le statut du créneau
    slot.isBooked = true;
    await slot.save();

    res.status(201).json({
      success: true,
      message: 'Rendez-vous réservé avec succès !',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réservation du rendez-vous.',
      error: error.message
    });
  }
};

// @desc    Consulter ses propres rendez-vous
// @route   GET /api/patients/appointments
// @access  Privé (Patient uniquement)
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('pro', 'name email specialty score bio')
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
      message: 'Erreur lors de la récupération de vos rendez-vous.',
      error: error.message
    });
  }
};

// @desc    Modifier son propre rendez-vous (Changer de créneau)
// @route   PUT /api/patients/appointments/:appointmentId
// @access  Privé (Patient uniquement)
exports.updateAppointment = async (req, res) => {
  try {
    const { newSlotId, notes } = req.body;
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous introuvable.'
      });
    }

    // S'assurer que le rendez-vous appartient à ce patient
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce rendez-vous.'
      });
    }

    // Si on change de créneau
    if (newSlotId && newSlotId !== appointment.slot.toString()) {
      const newSlot = await Slot.findById(newSlotId);
      if (!newSlot) {
        return res.status(404).json({
          success: false,
          message: 'Le nouveau créneau demandé est introuvable.'
        });
      }

      if (newSlot.isBooked) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau créneau demandé est déjà réservé par un autre patient.'
        });
      }

      // Rendre l'ancien créneau disponible
      const oldSlot = await Slot.findById(appointment.slot);
      if (oldSlot) {
        oldSlot.isBooked = false;
        await oldSlot.save();
      }

      // Réserver le nouveau créneau
      newSlot.isBooked = true;
      await newSlot.save();

      appointment.slot = newSlotId;
      appointment.pro = newSlot.pro; // Ajuster le professionnel si c'est un autre professionnel
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Rendez-vous modifié avec succès !',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du rendez-vous.',
      error: error.message
    });
  }
};

// @desc    Annuler son propre rendez-vous
// @route   DELETE /api/patients/appointments/:appointmentId
// @access  Privé (Patient uniquement)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous introuvable.'
      });
    }

    // S'assurer que le rendez-vous appartient à ce patient
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à annuler ce rendez-vous.'
      });
    }

    // Libérer le créneau de disponibilité
    const slot = await Slot.findById(appointment.slot);
    if (slot) {
      slot.isBooked = false;
      await slot.save();
    }

    // Supprimer le rendez-vous ou changer son statut en annulé (on va le supprimer pour faire propre)
    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Rendez-vous annulé avec succès.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation du rendez-vous.',
      error: error.message
    });
  }
};
