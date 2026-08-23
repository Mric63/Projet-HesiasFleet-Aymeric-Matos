# Hesias Fleet — Application Mobile (Android / Kotlin)

Outil de saisie sur site pour techniciens. Se connecte à l'API ASP.NET Core
`HesiasFleet.API` et permet de sélectionner un véhicule (manuellement ou par
scan QR), avant saisie des opérations.

## Stack

- Kotlin, Views XML + ViewBinding
- Architecture MVVM (ViewModel + LiveData + coroutines)
- Retrofit 2 + Gson pour l'accès REST
- OkHttp Interceptor pour l'injection du JWT (miroir de l'authInterceptor Angular)
- EncryptedSharedPreferences pour le stockage chiffré du token
- ZXing (journeyapps) pour le scan QR code

## Périmètre de cette version

| Exigence (§2.1.4) | État |
|---|---|
| Connexion utilisateur (login/mot de passe, JWT) | Fait |
| Persistance de session (reconnexion automatique) | Fait |
| Liste et recherche des véhicules | Fait |
| Sélection d'un véhicule | Fait |
| Reconnaissance véhicule par QR code (bonus) | Fait |
| Saisie d'opérations / méta-opérations | Fait |
| Assistance à la saisie (date/km repris) | Fait |
| Consultation du journal + notes | Fait |

## Configuration de l'URL API

Dans `app/build.gradle.kts`, `buildConfigField API_BASE_URL` :

- Émulateur Android → `http://10.0.2.2:5000/api/` (10.0.2.2 = localhost de l'hôte)
- Appareil physique → `http://<IP_de_votre_machine>:5000/api/`
- Production → domaine HTTPS ; retirer alors `usesCleartextTraffic` du manifest.

## Lancer le projet

Ouvrir le dossier dans Android Studio (Ladybug ou +), laisser Gradle
synchroniser, puis Run sur un émulateur API 24+.

## Comptes de test

Utiliser un login/mot de passe présent dans la table `Users` de la base
(créés via `POST api/users` ou seed SQL). Le mot de passe est haché en BCrypt
côté serveur.

## Correspondance avec l'API

| Écran | Endpoint |
|---|---|
| Connexion | `POST api/auth/login` |
| Liste véhicules | `GET api/vehicles` |

Les prochains écrans consommeront `GET api/operations/vehicle/{id}`,
`POST api/operations`, `GET api/notes/vehicle/{id}`, etc.
