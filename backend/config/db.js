const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/minidoctoplus');
    console.log(`📡 MongoDB Connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    console.log('💡 Astuce : Assurez-vous que votre serveur MongoDB est en cours d\'exécution (ex: mongod) ou fournissez une variable MONGODB_URI dans un fichier .env');
    // Ne pas arrêter le processus immédiatement pour permettre un fonctionnement gracieux ou des tests
    process.exit(1);
  }
};

module.exports = connectDB;
