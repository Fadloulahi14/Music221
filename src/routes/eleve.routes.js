'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/eleve.controller');
const validate = require('../middlewares/validate');
const { createEleveSchema, updateEleveSchema } = require('../validations/eleve.schema');
const { idParamSchema } = require('../validations/common.schema');

/**
 * @swagger
 * tags:
 *   name: Élèves
 *   description: Gestion des élèves
 */

/**
 * @swagger
 * /api/eleves:
 *   get:
 *     summary: Lister tous les élèves
 *     tags: [Élèves]
 *     responses:
 *       200:
 *         description: Liste des élèves
 */
router.get('/', ctrl.findAll);

/**
 * @swagger
 * /api/eleves/{id}:
 *   get:
 *     summary: Obtenir un élève par ID
 *     tags: [Élèves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Élève trouvé
 *       404:
 *         description: Introuvable
 */
router.get('/:id', validate(idParamSchema, 'params'), ctrl.findById);

/**
 * @swagger
 * /api/eleves:
 *   post:
 *     summary: Créer un élève
 *     tags: [Élèves]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prenom, nom, email, dateNaissance, niveau]
 *             properties:
 *               prenom:
 *                 type: string
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telephone:
 *                 type: string
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *                 example: "2000-05-20"
 *               niveau:
 *                 type: string
 *                 enum: [DEBUTANT, INTERMEDIAIRE, AVANCE]
 *     responses:
 *       201:
 *         description: Élève créé
 *       409:
 *         description: Email déjà utilisé
 *       422:
 *         description: Erreur de validation
 */
router.post('/', validate(createEleveSchema), ctrl.create);

/**
 * @swagger
 * /api/eleves/{id}:
 *   put:
 *     summary: Modifier un élève
 *     tags: [Élèves]
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
 *               prenom:
 *                 type: string
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *               niveau:
 *                 type: string
 *                 enum: [DEBUTANT, INTERMEDIAIRE, AVANCE]
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.put('/:id', validate(idParamSchema, 'params'), validate(updateEleveSchema), ctrl.update);

/**
 * @swagger
 * /api/eleves/{id}:
 *   delete:
 *     summary: Supprimer un élève
 *     tags: [Élèves]
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
 *         description: L'élève a des cours associés
 */
router.delete('/:id', validate(idParamSchema, 'params'), ctrl.delete);

module.exports = router;
