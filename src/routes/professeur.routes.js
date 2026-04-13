'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/professeur.controller');
const validate = require('../middlewares/validate');
const { createProfesseurSchema, updateProfesseurSchema } = require('../validations/professeur.schema');
const { idParamSchema } = require('../validations/common.schema');

/**
 * @swagger
 * tags:
 *   name: Professeurs
 *   description: Gestion des professeurs
 */

/**
 * @swagger
 * /api/professeurs:
 *   get:
 *     summary: Lister tous les professeurs
 *     tags: [Professeurs]
 *     responses:
 *       200:
 *         description: Liste des professeurs
 */
router.get('/', ctrl.findAll);

/**
 * @swagger
 * /api/professeurs/{id}:
 *   get:
 *     summary: Obtenir un professeur par ID
 *     tags: [Professeurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Professeur trouvé
 *       404:
 *         description: Introuvable
 */
router.get('/:id', validate(idParamSchema, 'params'), ctrl.findById);

/**
 * @swagger
 * /api/professeurs:
 *   post:
 *     summary: Créer un professeur
 *     tags: [Professeurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prenom, nom, email, instrumentPrincipal]
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
 *               instrumentPrincipal:
 *                 type: string
 *     responses:
 *       201:
 *         description: Professeur créé
 *       409:
 *         description: Email déjà utilisé
 *       422:
 *         description: Erreur de validation
 */
router.post('/', validate(createProfesseurSchema), ctrl.create);

/**
 * @swagger
 * /api/professeurs/{id}:
 *   put:
 *     summary: Modifier un professeur
 *     tags: [Professeurs]
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
 *               instrumentPrincipal:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mis à jour
 *       404:
 *         description: Introuvable
 */
router.put('/:id', validate(idParamSchema, 'params'), validate(updateProfesseurSchema), ctrl.update);

/**
 * @swagger
 * /api/professeurs/{id}:
 *   delete:
 *     summary: Supprimer un professeur
 *     tags: [Professeurs]
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
 *         description: Professeur a des cours PLANIFIE
 */
router.delete('/:id', validate(idParamSchema, 'params'), ctrl.delete);

module.exports = router;
