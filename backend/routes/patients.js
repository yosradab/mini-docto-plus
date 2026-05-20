const express = require('express');
const {
  getProfessionals,
  getProSlotsForPatient,
  bookAppointment,
  getPatientAppointments,
  updateAppointment,
  cancelAppointment
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes patients nécessitent d'être connecté ET d'avoir le rôle 'patient'
router.use(protect);
router.use(authorize('patient'));

router.route('/pros')
  .get(getProfessionals);

router.route('/pros/:proId/slots')
  .get(getProSlotsForPatient);

router.route('/appointments')
  .post(bookAppointment)
  .get(getPatientAppointments);

router.route('/appointments/:appointmentId')
  .put(updateAppointment)
  .delete(cancelAppointment);

module.exports = router;
