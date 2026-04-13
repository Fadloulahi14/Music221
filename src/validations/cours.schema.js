'use strict';
const { z } = require('zod');

const StatutCoursEnum = z.enum(['PLANIFIE', 'EFFECTUE', 'ANNULE'], {
  errorMap: () => ({ message: 'Le statut doit être PLANIFIE, EFFECTUE ou ANNULE' }),
});

const createCoursSchema = z.object({
  eleveId: z.number({ invalid_type_error: "L'ID de l'élève doit être un entier" }).int().positive(),
  professeurId: z.number({ invalid_type_error: "L'ID du professeur doit être un entier" }).int().positive(),
  instrumentId: z.number({ invalid_type_error: "L'ID de l'instrument doit être un entier" }).int().positive(),
  dateHeure: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'dateHeure invalide' })
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), {
      message: 'La dateHeure doit être dans le futur',
    }),
  duree: z.number({ invalid_type_error: 'La durée doit être un entier' }).int().positive('La durée doit être > 0'),
  statut: StatutCoursEnum.optional().default('PLANIFIE'),
});

const updateCoursSchema = z.object({
  statut: StatutCoursEnum,
});

module.exports = { createCoursSchema, updateCoursSchema };
