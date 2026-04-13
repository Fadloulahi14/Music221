'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/cours.controller');
const validate = require('../middlewares/validate');
const { createCoursSchema, updateCoursSchema } = require('../validations/cours.schema');
const { idParamSchema } = require('../validations/common.schema');

/**
 * @swagger
 * tags:
 *   name: Cours
 *   description: Gestion des cours particuliers
 */

/**
 * @swagger
 * /api/cours:
 *   get:
 *     summary: Lister tous les cours
 *     tags: [Cours]
 *     responses:
 *       200:
 *         description: Liste des cours
 */
router.get('/', ctrl.findAll);

/**
 * @swagger
 * /api/cours/{id}:
 *   get:
 *     summary: Obtenir un cours par ID
 *     tags: [Cours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cours trouvé
 *       404:
 *         description: Introuvable
 */
router.get('/:id', validate(idParamSchema, 'params'), ctrl.findById);

/**
 * @swagger
 * /api/cours:
 *   post:
 *     summary: Planifier un cours
 *     tags: [Cours]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eleveId, professeurId, instrumentId, dateHeure, duree]
 *             properties:
 *               eleveId:
 *                 type: integer
 *                 example: 1
 *               professeurId:
 *                 type: integer
 *                 example: 1
 *               instrumentId:
 *                 type: integer
 *                 example: 1
 *               dateHeure:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-05-15T10:00:00.000Z"
 *               duree:
 *                 type: integer
 *                 minimum: 1
 *                 example: 60
 *     responses:
 *       201:
 *         description: Cours planifié avec statut PLANIFIE
 *       400:
 *         description: dateHeure dans le passé
 *       404:
 *         description: Élève, professeur ou instrument introuvable
 *       409:
 *         description: Conflit (instrument indisponible ou créneau occupé)
 *       422:
 *         description: Erreur de validation
 */
router.post('/', validate(createCoursSchema), ctrl.create);

/**
 * @swagger
 * /api/cours/{id}/statut:
 *   patch:
 *     summary: Modifier le statut d'un cours
 *     tags: [Cours]
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
 *             required: [statut]
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [PLANIFIE, EFFECTUE, ANNULE]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       409:
 *         description: Cours déjà annulé
 */
router.patch('/:id/statut', validate(idParamSchema, 'params'), validate(updateCoursSchema), ctrl.updateStatut);

/**
 * @swagger
 * /api/cours/{id}:
 *   delete:
 *     summary: Supprimer un cours (seulement si EFFECTUE ou ANNULE)
 *     tags: [Cours]
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
 *         description: Impossible de supprimer un cours PLANIFIE
 */
router.delete('/:id', validate(idParamSchema, 'params'), ctrl.delete);

module.exports = router;
