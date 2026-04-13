'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/instrument.controller');
const validate = require('../middlewares/validate');
const { createInstrumentSchema, updateInstrumentSchema } = require('../validations/instrument.schema');
const { idParamSchema } = require('../validations/common.schema');

/**
 * @swagger
 * tags:
 *   name: Instruments
 *   description: Gestion des instruments
 */

/**
 * @swagger
 * /api/instruments:
 *   get:
 *     summary: Lister tous les instruments
 *     tags: [Instruments]
 *     responses:
 *       200:
 *         description: Liste des instruments
 */
router.get('/', ctrl.findAll);

/**
 * @swagger
 * /api/instruments/{id}:
 *   get:
 *     summary: Obtenir un instrument par ID
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Instrument trouvé
 *       404:
 *         description: Introuvable
 */
router.get('/:id', validate(idParamSchema, 'params'), ctrl.findById);

/**
 * @swagger
 * /api/instruments:
 *   post:
 *     summary: Enregistrer un instrument
 *     tags: [Instruments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, nom, valeurEstimee]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "PIANO-002"
 *               nom:
 *                 type: string
 *                 example: "Piano Steinway"
 *               statut:
 *                 type: string
 *                 enum: [DISPONIBLE, EN_PRET, HORS_SERVICE]
 *                 default: DISPONIBLE
 *               valeurEstimee:
 *                 type: number
 *                 minimum: 0
 *                 example: 5000000
 *     responses:
 *       201:
 *         description: Instrument créé
 *       409:
 *         description: Code déjà utilisé
 *       422:
 *         description: Erreur de validation
 */
router.post('/', validate(createInstrumentSchema), ctrl.create);

/**
 * @swagger
 * /api/instruments/{id}:
 *   put:
 *     summary: Modifier un instrument
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               nom:
 *                 type: string
 *               statut:
 *                 type: string
 *                 enum: [DISPONIBLE, EN_PRET, HORS_SERVICE]
 *               valeurEstimee:
 *                 type: number
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.put('/:id', validate(idParamSchema, 'params'), validate(updateInstrumentSchema), ctrl.update);

/**
 * @swagger
 * /api/instruments/{id}:
 *   delete:
 *     summary: Supprimer un instrument
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supprimé
 *       409:
 *         description: L'instrument a des cours PLANIFIE
 */
router.delete('/:id', validate(idParamSchema, 'params'), ctrl.delete);

module.exports = router;
