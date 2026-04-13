'use strict';
const { z } = require('zod');

const createProfesseurSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est obligatoire').trim(),
  nom: z.string().min(1, 'Le nom est obligatoire').trim(),
  email: z.string().email('Email invalide').toLowerCase(),
  telephone: z.string().optional(),
  instrumentPrincipal: z.string().min(1, "L'instrument principal est obligatoire").trim(),
});

const updateProfesseurSchema = createProfesseurSchema.partial();

module.exports = { createProfesseurSchema, updateProfesseurSchema };
