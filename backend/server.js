const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Charger les variables d'environnement
dotenv.config();

// Connecter à la base de données
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Message de bienvenue à l'API
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API de Mini Docto+ !',
    version: '1.0.0',
    documentation: 'Voir le README pour la liste des points de terminaison (endpoints).'
  });
});

// Définir les routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pros', require('./routes/pros'));
app.use('/api/patients', require('./routes/patients'));

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur interne est survenue sur le serveur.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`);
  console.log(`🔗 URL locale : http://localhost:${PORT}`);
});

// Gérer les rejets de promesses non capturés
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Erreur critique : ${err.message}`);
  // Fermer le serveur & quitter le processus
  server.close(() => process.exit(1));
});
