'use strict';
const { z } = require('zod');

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID doit être un entier').transform(Number),
});

module.exports = { idParamSchema };
