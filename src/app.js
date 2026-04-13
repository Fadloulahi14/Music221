'use strict';
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();

// ─── Middlewares globaux ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Swagger ──────────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MUSIC 221 API',
      version: '1.0.0',
      description: `
## API de gestion de l'école de musique MUSIC 221

### Ressources disponibles
- **Professeurs** : Gestion des professeurs et de leurs instruments
- **Élèves** : Gestion des élèves et de leur niveau
- **Instruments** : Gestion du parc d'instruments
- **Cours** : Planification et suivi des cours particuliers

### Règles métier clés
- Un cours ne peut être planifié que si l'instrument est **DISPONIBLE**
- Un professeur ne peut pas avoir **deux cours à la même dateHeure**
- La **dateHeure** d'un cours doit être dans le futur
- La suppression d'un professeur/instrument est bloquée s'il a des cours **PLANIFIE**
      `,
      contact: {
        name: 'MUSIC 221 - Fallou Ndiaye',
        email: 'contact@music221.sn',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      schemas: {
        Professeur: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            prenom: { type: 'string', example: 'Amadou' },
            nom: { type: 'string', example: 'Diallo' },
            email: { type: 'string', example: 'amadou.diallo@music221.sn' },
            telephone: { type: 'string', example: '+221701234567' },
            instrumentPrincipal: { type: 'string', example: 'Piano' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Eleve: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            prenom: { type: 'string', example: 'Ibrahima' },
            nom: { type: 'string', example: 'Ndiaye' },
            email: { type: 'string', example: 'ibrahima.ndiaye@email.com' },
            telephone: { type: 'string', example: '+221771112233' },
            dateNaissance: { type: 'string', format: 'date', example: '2005-03-15' },
            niveau: { type: 'string', enum: ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Instrument: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            code: { type: 'string', example: 'PIANO-001' },
            nom: { type: 'string', example: 'Piano Yamaha' },
            statut: { type: 'string', enum: ['DISPONIBLE', 'EN_PRET', 'HORS_SERVICE'] },
            valeurEstimee: { type: 'number', example: 2500000 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Cours: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            eleveId: { type: 'integer', example: 1 },
            professeurId: { type: 'integer', example: 1 },
            instrumentId: { type: 'integer', example: 1 },
            dateHeure: { type: 'string', format: 'date-time' },
            duree: { type: 'integer', example: 60 },
            statut: { type: 'string', enum: ['PLANIFIE', 'EFFECTUE', 'ANNULE'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Erreur de validation' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  champ: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
  customSiteTitle: 'MUSIC 221 API Docs',
}));

// ─── Route santé ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MUSIC 221 API opérationnelle',
    timestamp: new Date().toISOString(),
    docs: '/api-docs',
  });
});

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Middlewares d'erreur ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
