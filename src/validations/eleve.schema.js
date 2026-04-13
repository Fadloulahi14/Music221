'use strict';
const { z } = require('zod');

const NiveauEnum = z.enum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'], {
  errorMap: () => ({ message: 'Le niveau doit être DEBUTANT, INTERMEDIAIRE ou AVANCE' }),
});

const createEleveSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est obligatoire').trim(),
  nom: z.string().min(1, 'Le nom est obligatoire').trim(),
  email: z.string().email('Email invalide').toLowerCase(),
  telephone: z.string().optional(),
  dateNaissance: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Date de naissance invalide' })
    .transform((val) => new Date(val))
    .refine((date) => date <= new Date(), {
      message: 'La date de naissance ne peut pas être dans le futur',
    }),
  niveau: NiveauEnum,
});

const updateEleveSchema = createEleveSchema.partial();

module.exports = { createEleveSchema, updateEleveSchema };
