const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Slot = require('./models/Slot');
const Appointment = require('./models/Appointment');

dotenv.config();

const professionals = [
  {
    name: 'Dr. Sophie Laurent',
    email: 'sophie.laurent@doctoplus.fr',
    password: 'password123',
    role: 'pro',
    specialty: 'Cardiologue',
    bio: 'Ancienne chef de clinique des hôpitaux de Paris, spécialiste des troubles du rythme et de l\'insuffisance cardiaque.',
    score: 98
  },
  {
    name: 'Dr. Marc Benhamou',
    email: 'marc.benhamou@doctoplus.fr',
    password: 'password123',
    role: 'pro',
    specialty: 'Pédiatre',
    bio: 'Pédiatrie générale et néonatologie. Accompagnement bienveillant du développement de l\'enfant de 0 à 16 ans.',
    score: 89
  },
  {
    name: 'Dr. Leïla Belkacem',
    email: 'leila.belkacem@doctoplus.fr',
    password: 'password123',
    role: 'pro',
    specialty: 'Médecin Généraliste',
    bio: 'Médecine de famille, consultations de prévention, suivis pédiatriques et gynécologiques de premier recours.',
    score: 78
  },
  {
    name: 'Dr. Thomas Roux',
    email: 'thomas.roux@doctoplus.fr',
    password: 'password123',
    role: 'pro',
    specialty: 'Dentiste',
    bio: 'Chirurgien-dentiste spécialisé en esthétique du sourire et implantologie. Équipement moderne en cabinet.',
    score: 65
  },
  {
    name: 'Dr. Julie Morel',
    email: 'julie.morel@doctoplus.fr',
    password: 'password123',
    role: 'pro',
    specialty: 'Ophtalmologue',
    bio: 'Suivi de la vision, prescription de lunettes et lentilles, dépistage et traitement chirurgical de la cataracte.',
    score: 52
  }
];

const patients = [
  {
    name: 'Jean Dupont',
    email: 'jean.dupont@gmail.com',
    password: 'password123',
    role: 'patient'
  },
  {
    name: 'Marie Curie',
    email: 'marie.curie@gmail.com',
    password: 'password123',
    role: 'patient'
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/minidoctoplus');
    console.log('📡 Base de données connectée pour l\'initialisation...');

    // Nettoyer la base de données
    await User.deleteMany();
    await Slot.deleteMany();
    await Appointment.deleteMany();
    console.log('🧹 Base de données nettoyée.');

    // Insérer les professionnels
    const createdPros = [];
    for (const pro of professionals) {
      const p = await User.create(pro);
      createdPros.push(p);
      console.log(`👨‍⚕️ Professionnel créé : ${p.name} (Score: ${p.score})`);
    }

    // Insérer les patients
    const createdPatients = [];
    for (const patient of patients) {
      const pat = await User.create(patient);
      createdPatients.push(pat);
      console.log(`👤 Patient créé : ${pat.name}`);
    }

    // Générer quelques créneaux horaires fictifs pour demain et après-demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    const slotsData = [
      { date: tomorrowStr, startTime: '09:00', endTime: '09:30' },
      { date: tomorrowStr, startTime: '10:00', endTime: '10:30' },
      { date: tomorrowStr, startTime: '14:00', endTime: '14:30' },
      { date: tomorrowStr, startTime: '15:30', endTime: '16:00' },
      { date: dayAfterStr, startTime: '09:30', endTime: '10:00' },
      { date: dayAfterStr, startTime: '11:00', endTime: '11:30' },
      { date: dayAfterStr, startTime: '15:00', endTime: '15:30' }
    ];

    // Ajouter des créneaux pour Dr. Sophie Laurent (score 98) et Dr. Marc Benhamou (score 89)
    for (const pro of createdPros.slice(0, 3)) {
      for (const slotItem of slotsData) {
        await Slot.create({
          pro: pro._id,
          date: slotItem.date,
          startTime: slotItem.startTime,
          endTime: slotItem.endTime,
          isBooked: false
        });
      }
      console.log(`📅 Créneaux ajoutés pour : ${pro.name}`);
    }

    console.log('✅ Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Erreur lors de l'initialisation : ${error.message}`);
    process.exit(1);
  }
};

seedData();
