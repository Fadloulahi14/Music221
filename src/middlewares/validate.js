'use strict';

/**
 * Middleware de validation Zod
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'params'|'query'} target
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        champ: e.path.join('.'),
        message: e.message,
      }));
      return res.status(422).json({
        success: false,
        message: 'Erreur de validation',
        errors,
      });
    }
    req[target] = result.data;
    next();
  };
};

module.exports = validate;
