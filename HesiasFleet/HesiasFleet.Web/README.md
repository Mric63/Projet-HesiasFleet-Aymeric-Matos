# Hesias Fleet — Frontend Web (Angular 19)

Console de gestion complète : véhicules, journal d'entretien, butées, magasin.

## Stack

- Angular 19, standalone components, signals
- Angular Material 19 (thème M3)
- HttpClient + interceptor fonctionnel pour le JWT
- Lazy loading par route

## Prérequis côté API

Deux corrections sont nécessaires dans `HesiasFleet.API/Program.cs` :

1. `app.UseAuthentication()` doit être appelé **avant** `app.UseAuthorization()` et
   **avant** `app.Run()`. Actuellement il est placé après `app.Run()`, donc jamais
   exécuté : les endpoints `[Authorize]` renvoient 401 systématiquement.
2. Ajouter une politique CORS autorisant `http://localhost:4200`, sinon le
   navigateur bloque toutes les requêtes du front en développement.

## Démarrage

```bash
npm install
npm start          # http://localhost:4200
```

L'URL de l'API se configure dans `src/environments/environment.ts`
(par défaut `http://localhost:5000/api`).

## Build & Docker

```bash
npm run build
docker build -t hesias-fleet-web .
```

En production, nginx sert les fichiers statiques et proxifie `/api/` vers le
service `api` du docker-compose : le front et l'API sont alors sur la même
origine, ce qui rend CORS inutile.

## Arborescence

```
src/app/
  core/
    models/        # types alignés sur les DTOs C#
    services/      # un service par contrôleur de l'API
    interceptors/  # injection du Bearer token, déconnexion sur 401
    guards/        # protection des routes authentifiées
  features/
    auth/          # page de connexion
    dashboard/     # KPIs, butées atteintes, alertes de stock
    vehicles/      # liste, détail (journal + butées + fiche), formulaires
    operations/    # dialogue de saisie d'opération / méta-opération
    parts/         # magasin, mouvements de stock
```

## Couverture fonctionnelle (cahier des charges §2.1)

| Exigence | État |
|---|---|
| Comptes utilisateur, login/password | Fait (JWT) |
| Magasin : catégorie / marque / référence | Fait |
| Autocomplétion des dénominations | Fait |
| Minimum + alerte de stock | Fait (bannière + KPI dashboard) |
| Entrées de stock avec prix unitaire | Fait |
| Ajustement (casse, perte) | Fait |
| Déstockage prioritaire du lot le moins cher | Géré côté API (`StockService`) |
| Véhicules : immat ancienne/nouvelle, identifiant libre | Fait |
| Propriétés étendues (type moteur…) | Fait (bonus) |
| Journal du véhicule | Fait (timeline fusionnée) |
| Opérations : date, km, libellé, consommables, pièces libres | Fait |
| Méta-opérations | Fait |
| Butées calendaires et kilométriques | Fait |
| Échéances en incrément **et** en absolu | Fait |
| Notes libres ou rattachées | Fait (libres ; rattachement à venir) |
| Assistance à la saisie (date/km repris) | Fait |
| Notifications de butée | Fait (badge toolbar + dashboard) |

## Reste à faire

- Édition d'un véhicule/pièce existant (l'API n'expose pas encore de `PUT`)
- Rattachement d'une note à une opération depuis l'UI
- Génération du rapport PDF (bonus §2.1.5)
- Gestion des utilisateurs depuis l'interface (`UsersController` existe déjà)
