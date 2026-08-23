# Hesias Fleet — déploiement Docker

L'ensemble de l'application (base de données, API, front web) démarre avec une
seule commande. C'est la procédure d'installation attendue par le sujet, qui
exige que l'application web s'exécute dans un conteneur.

## Prérequis

Docker Desktop (Windows/macOS) ou Docker Engine + plugin Compose (Linux).

## Démarrage

```bash
cp .env.example .env      # facultatif : personnaliser les identifiants
docker compose up -d --build
```

| Service | URL | Rôle |
|---|---|---|
| web | http://localhost:4200 | Front Angular servi par nginx |
| api | http://localhost:8080/swagger | API REST ASP.NET Core |
| db  | localhost:5432 | PostgreSQL 16 |

Le front appelle l'API en chemin relatif `/api/` ; nginx proxifie ces requêtes
vers `api:8080` à l'intérieur du réseau Docker. Front et API sont donc vus par
le navigateur sur la même origine, ce qui rend CORS inutile en production.

## Cycle de vie

```bash
docker compose logs -f api    # journaux de l'API
docker compose logs db        # vérifier l'exécution des scripts d'init
docker compose stop           # arrêter sans rien perdre
docker compose down           # supprimer les conteneurs, garder les données
docker compose down -v        # TOUT supprimer, y compris la base
```

## Initialisation de la base

Au tout premier démarrage — c'est-à-dire tant que le volume `hesias_pgdata`
est vide — PostgreSQL exécute automatiquement, par ordre alphabétique, les
scripts présents dans `db/init/` :

- `01-schema.sql` : schéma complet (tables, index, contraintes), généré depuis
  les migrations EF Core avec
  `dotnet ef migrations script --idempotent -p HesiasFleet.Infrastructure -s HesiasFleet.API -o db/init/01-schema.sql`
- `02-seed.sql` : jeu de données de démonstration.

Ces scripts ne sont **pas** rejoués aux démarrages suivants. Pour repartir
d'une base vierge :

```bash
docker compose down -v && docker compose up -d
```

## Régénérer le jeu de données

Après avoir saisi des données de démonstration via l'application :

```bash
docker exec hesiasfleet-db pg_dump -U hesias -d hesiasfleet --data-only --inserts > db/init/02-seed.sql
```

Si le rejeu échoue sur des contraintes de clés étrangères, encadrer le fichier
par `SET session_replication_role = replica;` et
`SET session_replication_role = origin;`.

## Développement hors Docker

Seule la base tourne en conteneur, l'API et le front en local :

```bash
docker compose up -d db
dotnet run --project HesiasFleet.API     # http://localhost:5131
cd HesiasFleet.Web && npm start          # http://localhost:4200
```

Dans ce mode, le front appelle `http://localhost:5131/api` et la politique CORS
`AngularDev` de `Program.cs` autorise l'origine `http://localhost:4200`.
