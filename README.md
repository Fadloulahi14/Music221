# 🎵 MUSIC 221 — API de gestion d'école de musique

> Projet Node.js — Sujet 15 | Fallou Ndiaye  
> Stack : **Node.js · Express · Prisma · Zod · Swagger**

---

## 📁 Architecture du projet

```
music221/
├── prisma/
│   ├── migrations/
│   │   └── 20260101000000_init/
│   │       └── migration.sql
│   ├── schema.prisma          # Modèles Prisma (SQLite)
│   └── seed.js                # Données initiales
├── src/
│   ├── app.js                 # Configuration Express + Swagger
│   ├── server.js              # Point d'entrée
│   ├── config/
│   │   ├── db.js              # Client Prisma singleton
│   │   └── env.js             # Variables d'environnement
│   ├── controllers/
│   │   ├── base.controller.js
│   │   ├── professeur.controller.js
│   │   ├── eleve.controller.js
│   │   ├── instrument.controller.js
│   │   └── cours.controller.js
│   ├── middlewares/
│   │   ├── errorHandler.js    # Gestion globale des erreurs
│   │   ├── notFound.js        # Route introuvable
│   │   └── validate.js        # Validation Zod
│   ├── repositories/
│   │   ├── base.repo.js
│   │   ├── professeur.repo.js
│   │   ├── eleve.repo.js
│   │   ├── instrument.repo.js
│   │   └── cours.repo.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── professeur.routes.js
│   │   ├── eleve.routes.js
│   │   ├── instrument.routes.js
│   │   └── cours.routes.js
│   ├── services/
│   │   ├── base.service.js
│   │   ├── professeur.service.js
│   │   ├── eleve.service.js
│   │   ├── instrument.service.js
│   │   └── cours.service.js
│   ├── utils/
│   │   ├── httpError.js       # Classe d'erreurs HTTP
│   │   └── response.js        # Helpers de réponse JSON
│   └── validations/
│       ├── common.schema.js
│       ├── professeur.schema.js
│       ├── eleve.schema.js
│       ├── instrument.schema.js
│       └── cours.schema.js
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Installation et démarrage

### Prérequis
- Node.js >= 18
- npm >= 9

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
Le fichier `.env` est déjà configuré pour SQLite (aucune installation de base de données requise) :
```env
DATABASE_URL="file:./music221.db"
PORT=3000
NODE_ENV=development
```

### 3. Générer le client Prisma et appliquer les migrations
```bash
npm run db:generate
npm run db:migrate
```
> Entrez un nom pour la migration, ex : `init`

### 4. (Optionnel) Insérer les données de test
```bash
npm run db:seed
```

### 5. Démarrer le serveur
```bash
# Production
npm start

# Développement (rechargement auto)
npm run dev
```

---

## 🌐 Endpoints disponibles

| Méthode | Route                    | Description                          |
|---------|--------------------------|--------------------------------------|
| GET     | /health                  | Santé de l'API                       |
| GET     | /api-docs                | Documentation Swagger interactive    |
| **Professeurs** | | |
| GET     | /api/professeurs         | Lister tous les professeurs          |
| GET     | /api/professeurs/:id     | Détail d'un professeur               |
| POST    | /api/professeurs         | Créer un professeur                  |
| PUT     | /api/professeurs/:id     | Modifier un professeur               |
| DELETE  | /api/professeurs/:id     | Supprimer (bloqué si cours PLANIFIE) |
| **Élèves** | | |
| GET     | /api/eleves              | Lister tous les élèves               |
| GET     | /api/eleves/:id          | Détail d'un élève                    |
| POST    | /api/eleves              | Créer un élève                       |
| PUT     | /api/eleves/:id          | Modifier un élève                    |
| DELETE  | /api/eleves/:id          | Supprimer (bloqué si cours associés) |
| **Instruments** | | |
| GET     | /api/instruments         | Lister tous les instruments          |
| GET     | /api/instruments/:id     | Détail d'un instrument               |
| POST    | /api/instruments         | Enregistrer un instrument            |
| PUT     | /api/instruments/:id     | Modifier un instrument               |
| DELETE  | /api/instruments/:id     | Supprimer (bloqué si cours PLANIFIE) |
| **Cours** | | |
| GET     | /api/cours               | Lister tous les cours                |
| GET     | /api/cours/:id           | Détail d'un cours                    |
| POST    | /api/cours               | Planifier un cours                   |
| PATCH   | /api/cours/:id/statut    | Changer le statut d'un cours         |
| DELETE  | /api/cours/:id           | Supprimer (seulement si ANNULE/EFFECTUE) |

---

## ✅ Règles métier implémentées

### Planification d'un cours
- ✅ Vérification existence élève, professeur et instrument
- ✅ Instrument doit être `DISPONIBLE`
- ✅ `dateHeure` doit être dans le futur
- ✅ Aucun conflit de créneau pour le professeur
- ✅ Statut initialisé à `PLANIFIE`

### Suppressions protégées
- ✅ Professeur avec cours `PLANIFIE` → **interdit**
- ✅ Élève avec des cours (tous statuts) → **interdit**
- ✅ Instrument avec cours `PLANIFIE` → **interdit**

### Validations Zod
- ✅ Emails uniques (professeur, élève)
- ✅ Code instrument unique
- ✅ `dateNaissance` ≤ aujourd'hui
- ✅ `valeurEstimee` ≥ 0
- ✅ `duree` entier > 0
- ✅ Enums stricts (niveau, statut instrument, statut cours)

---

## 📖 Documentation Swagger

Après démarrage, ouvrez : **http://localhost:3000/api-docs**

---

## 🧪 Exemples de requêtes

### Créer un professeur
```bash
curl -X POST http://localhost:3000/api/professeurs \
  -H "Content-Type: application/json" \
  -d '{
    "prenom": "Fallou",
    "nom": "Ndiaye",
    "email": "fallou.ndiaye@music221.sn",
    "telephone": "+221771234567",
    "instrumentPrincipal": "Kora"
  }'
```

### Planifier un cours
```bash
curl -X POST http://localhost:3000/api/cours \
  -H "Content-Type: application/json" \
  -d '{
    "eleveId": 1,
    "professeurId": 1,
    "instrumentId": 1,
    "dateHeure": "2026-06-01T10:00:00.000Z",
    "duree": 60
  }'
```

### Changer le statut d'un cours
```bash
curl -X PATCH http://localhost:3000/api/cours/1/statut \
  -H "Content-Type: application/json" \
  -d '{"statut": "EFFECTUE"}'
```
