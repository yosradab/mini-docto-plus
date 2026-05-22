# Mini Docto+

Mini Docto+ est une mini-application de mise en relation entre patients et professionnels de sante.

Le projet est compose de trois parties:

- `backend/`: API REST Spring Boot + MongoDB.
- `pro-web/`: application web React/Vite pour les professionnels.
- `patient-mobile/`: application Flutter pour les patients.

## Fonctionnalites

### Authentification

- Inscription et connexion des patients.
- Inscription et connexion des professionnels.
- Authentification par JWT.
- Separation des acces par role: `patient` et `pro`.

### Patient

- Consulter la liste des professionnels disponibles.
- Voir les professionnels tries par score decroissant.
- Reserver un creneau horaire.
- Consulter ses rendez-vous.
- Modifier ou annuler uniquement ses propres rendez-vous.

### Professionnel

- Ajouter des creneaux de disponibilite.
- Supprimer ses propres creneaux.
- Consulter la liste des rendez-vous reserves par les patients.

## Prerequis

- Java 17.
- MongoDB local ou MongoDB Atlas.
- Node.js et npm.
- Flutter SDK.

## Installation et lancement

### 1. Backend Spring Boot

Configurer MongoDB dans:

```text
backend/src/main/resources/application.properties
```

Configuration par defaut:

```properties
server.port=5000
spring.data.mongodb.uri=mongodb://localhost:27017/minidoctoplus
```

Lancer le backend:

```bash
cd backend
./mvnw spring-boot:run
```

Sur Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API locale:

```text
http://localhost:5000/api
```

Swagger:

```text
http://localhost:5000/swagger-ui/index.html
```

### 2. Application web professionnel

```bash
cd pro-web
npm install
npm run dev
```

URL locale:

```text
http://localhost:5173
```

Si besoin, configurer l'URL du backend dans `pro-web/.env` ou `.env.development`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Application mobile patient Flutter

```bash
cd patient-mobile
flutter pub get
flutter run
```

Pour lancer directement sur Chrome:

```bash
flutter run -d chrome
```

Configuration API Flutter:

- Web / desktop: `http://localhost:5000/api`
- Android emulator: `http://10.0.2.2:5000/api`
- Appareil physique: utiliser l'IP locale du PC:

```bash
flutter run --dart-define=API_HOST=192.168.1.10
```

## Tests

Backend:

```bash
cd backend
./mvnw test
```

Web:

```bash
cd pro-web
npm run lint
npm run build
```

Flutter:

```bash
cd patient-mobile
flutter analyze
flutter test
```

## Securite

- Les mots de passe sont hashes avec BCrypt avant d'etre stockes.
- L'authentification utilise des tokens JWT.
- Les routes sont protegees avec Spring Security.
- Les routes patient sont reservees au role `PATIENT`.
- Les routes professionnel sont reservees au role `PRO`.
- Un patient ne peut modifier ou annuler que ses propres rendez-vous.
- Un professionnel ne peut supprimer que ses propres creneaux.
- Les reponses API ne renvoient pas les mots de passe.

## Performance

- MongoDB est utilise pour stocker les utilisateurs, creneaux et rendez-vous.
- L'email utilisateur est indexe pour accelerer la recherche et eviter les doublons.
- Les creneaux ont un index compose unique sur `pro`, `date` et `startTime` pour eviter les doublons.
- Les rendez-vous ont un index unique sur `slot` pour eviter la double reservation.
- Le tri des professionnels par score decroissant est fait cote backend, ce qui evite un tri inutile cote mobile.
- Les clients React et Flutter consomment uniquement les donnees necessaires.

## Validation locale

Commandes validees:

- `backend`: `.\mvnw.cmd test`
- `pro-web`: `npm.cmd run lint`
- `pro-web`: `npm.cmd run build`

Flutter doit etre valide sur une machine ayant le SDK Flutter installe avec:

```bash
flutter analyze
flutter test
```
Firebase capture 
<img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/67f61326-ed94-4ff8-a269-380c7c05fcbf" />

