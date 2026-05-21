# 🩺 Mini Docto+ — Test Technique

Bienvenue dans le projet **Mini Docto+**, une solution full-stack moderne conçue pour mettre en relation les patients et les professionnels de santé. Ce projet a été développé dans le cadre d'un test technique visant à évaluer des compétences d'architecture, de sécurité, de performance et d'ergonomie UX/UI.

---

## 🏗️ Architecture du Projet

Le projet est divisé en trois sous-dossiers distincts et autonomes :

1. **`backend/`** : API REST robuste en **Spring Boot (Java)** connectée à **MongoDB**. Authentification sécurisée par JWT, contrôle d'accès par rôles et gestion de données performante.
2. **`pro-web/`** : Application web pour les professionnels de santé, construite en **React + Vite** et stylisée avec du **Vanilla CSS ultra-moderne** (thème sombre, glassmorphism, transitions fluides et responsive).
3. **`patient-mobile/`** : Application mobile et multiplateforme pour les patients, développée en **Flutter** en utilisant le state management **Provider** pour une gestion de flux propre et réactive.

---

## 📸 Capture d'Écran — Dashboard Firebase & Analytics

Dans le cadre du suivi des utilisateurs et du taux d'engagement de Mini Docto+, un tableau de bord d'analyse a été mis en œuvre. La capture d'écran ci-dessous représente le dashboard **Firebase / Google Analytics** avec les indicateurs clés de performance (KPI) et les événements personnalisés :

![Firebase Analytics Dashboard](./firebase_analytics.png)

### 📊 Explication des Événements Trackés :
*   `patient_registered` / `pro_registered` : Permet de mesurer le ratio d'acquisition entre patients et professionnels.
*   `appointment_booked` : Déclenché lorsqu'un patient confirme un rendez-vous (calcul du taux de conversion).
*   `appointment_modified` : Analyse de l'instabilité des rendez-vous (combien de patients modifient leur créneau).
*   `appointment_cancelled` : Mesure du taux de désistement pour optimiser la disponibilité des médecins.

---

## 🚀 Guide d'Installation et de Démarrage

### 1. Prérequis
### 1️⃣ Prérequis
* **Java 8 / Maven** – pour compiler et exécuter le backend Spring Boot.
* **MongoDB** (local ou Atlas) – base de données utilisée par l’API.
* **Flutter SDK** – pour lancer l’application mobile.

---

### 2️⃣ Démarrer le Serveur Backend (`backend/`)
Le serveur tourne par défaut sur `http://localhost:5000`.

```bash
# Entrer dans le répertoire backend
cd backend

# Lancer l’application Spring Boot
mvn spring-boot:run
```


**Identifiants de test générés par le seed :**
*   **Patients :**
    *   `jean.dupont@gmail.com` / `password123`
    *   `marie.curie@gmail.com` / `password123`
*   **Professionnels (Pros) :**
    *   `sophie.laurent@doctoplus.fr` / `password123` (Score: 98 - Cardiologue)
    *   `marc.benhamou@doctoplus.fr` / `password123` (Score: 89 - Pédiatre)
    *   `leila.belkacem@doctoplus.fr` / `password123` (Score: 78 - Généraliste)

---

### 3. Lancer le Dashboard Professionnel (`pro-web/`)
L'application professionnelle permet aux médecins de s'inscrire, se connecter, définir leurs créneaux et voir les réservations des patients.

```bash
# Entrer dans le répertoire pro-web
cd pro-web

# Installer les dépendances
npm install

# Lancer le serveur de développement Vite
npm run dev
```
Ouvrez l'URL affichée par Vite (généralement `http://localhost:5173`) dans votre navigateur.

---

### 4. Lancer l'Application Patient (`patient-mobile/`)
L'application mobile permet aux patients de consulter les médecins (triés par score), de réserver, de modifier et d'annuler leurs rendez-vous.

```bash
# Entrer dans le répertoire patient-mobile
cd patient-mobile

# Récupérer les paquets Flutter
flutter pub get

# Lancer l'application sur un simulateur ou appareil connecté
flutter run
```
> 💡 **Note pour le développement mobile :** 
> Dans `lib/services/api_service.dart`, la variable `baseUrl` est configurée pour utiliser dynamiquement `http://10.0.2.2:5000/api` sur l'émulateur Android standard (qui redirige vers le localhost de la machine hôte) et `http://localhost:5000/api` sur simulateur iOS ou support Web.

---

## 🔐 Focus Sécurité

La sécurité est un pilier fondamental de Mini Docto+. Plusieurs mécanismes industriels ont été intégrés :

1.  **Chiffrement des Mots de Passe** :
    *   Utilisation de la bibliothèque `bcryptjs` avec un facteur de coût (Salt) de `10`.
    *   Le mot de passe n'est jamais stocké en clair. Le chiffrement s'effectue automatiquement via un hook Mongoose `pre('save')` avant l'écriture en base de données.
    *   La clé de mot de passe est explicitement exclue des requêtes SQL/NoSQL standards via la clause `select: false` du schéma utilisateur.

2.  **Authentification et Autorisation par Rôle (RBAC)** :
    *   Génération de jetons **JWT (JSON Web Tokens)** sécurisés lors de l'authentification.
    *   Mise en place de deux middlewares de protection :
        *   `protect` : Valide la signature du token et extrait l'utilisateur actif de la session.
        *   `authorize('patient', 'pro')` : Bloque l'accès aux routes spécifiques. Par exemple, un patient ne pourra **jamais** supprimer ou ajouter un créneau de disponibilité, et un médecin ne pourra pas modifier un rendez-vous d'un patient.

3.  **Contrôle strict de Propriété des Données** :
    *   Sur les routes de modification (`PUT /api/patients/appointments/:id`) et d'annulation (`DELETE /api/patients/appointments/:id`), l'API vérifie systématiquement que l'identifiant du patient connecté correspond exactement au champ `patient` associé au rendez-vous. Cela empêche les attaques d'IDOR (Insecure Direct Object Reference).

4.  **Sécurisation CORS & Entrées** :
    *   Activation de `cors()` pour restreindre les accès non autorisés provenant d'autres domaines.
    *   Sanitisation automatique des requêtes et validations strictes de formats (ex: expression régulière pour valider le format de l'email).

---

## ⚡ Focus Performance

La réactivité de l'application est garantie par des choix de conception de bases de données et d'échange de données optimisés :

1.  **Indexation de Base de Données MongoDB (Mongoose)** :
    *   **Index Composé Unique** sur le modèle `Slot` : `{ pro: 1, date: 1, startTime: 1 }` avec contrainte unique. Cela permet une recherche ultra-rapide en temps constant $O(1)$ des disponibilités et empêche la création accidentelle de créneaux en doublons pour le même praticien.
    *   **Index Unique** sur le modèle `Appointment` : `{ slot: 1 }`. Un créneau horaire ne peut être associé qu'à un seul rendez-vous actif à la fois, éliminant les conflits d'écritures concurrentes (double-réservation).

2.  **Tri Optimal (Score de Réputation)** :
    *   La fonctionnalité de tri des professionnels par score décroissant s'effectue directement au niveau du serveur de base de données MongoDB (`User.find({ role: 'pro' }).sort({ score: -1 })`). Grâce au moteur MongoDB, ce tri est extrêmement performant et soulage la mémoire du client (React ou Flutter) qui n'a pas à trier les données côté front-end.

3.  **Payloads Légers (Populate Sélectif)** :
    *   Pour économiser de la bande passante sur mobile, les jointures (`populate`) ne récupèrent que les champs strictement nécessaires. Par exemple, au lieu de charger tout le profil complet d'un médecin lors de l'affichage d'un rendez-vous, l'API ne récupère que `{ name, email, specialty, score }`, évitant de renvoyer le mot de passe chiffré, la date de création ou la biographie longue si elle n'est pas requise.

---

*Développé avec passion pour Mini Docto+*
# Mini_DoctoPlus
# Mini_DoctoPlus
# Mini_DoctoPlus
# Mini-docto-plus
