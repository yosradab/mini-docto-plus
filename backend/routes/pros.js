const express = require('express');
const {
  addSlot,
  deleteSlot,
  getProSlots,
  getProAppointments
} = require('../controllers/proController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes professionnelles nécessitent d'être connecté ET d'avoir le rôle 'pro'
router.use(protect);
router.use(authorize('pro'));

router.route('/slots')
  .post(addSlot)
  .get(getProSlots);

router.route('/slots/:slotId')
  .delete(deleteSlot);

router.route('/appointments')
  .get(getProAppointments);

module.exports = router;
