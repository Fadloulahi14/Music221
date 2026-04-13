'use strict';
const { z } = require('zod');

const StatutInstrumentEnum = z.enum(['DISPONIBLE', 'EN_PRET', 'HORS_SERVICE'], {
  errorMap: () => ({ message: 'Le statut doit être DISPONIBLE, EN_PRET ou HORS_SERVICE' }),
});

const createInstrumentSchema = z.object({
  code: z.string().min(1, 'Le code est obligatoire').trim(),
  nom: z.string().min(1, 'Le nom est obligatoire').trim(),
  statut: StatutInstrumentEnum.default('DISPONIBLE'),
  valeurEstimee: z.number({ invalid_type_error: 'La valeur doit être un nombre' }).min(0, 'La valeur doit être ≥ 0'),
});

const updateInstrumentSchema = createInstrumentSchema.partial();

module.exports = { createInstrumentSchema, updateInstrumentSchema };
