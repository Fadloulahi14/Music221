'use strict';
const HttpError = require('../utils/httpError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Erreurs Prisma
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'champ';
    return res.status(409).json({
      success: false,
      message: `Conflit : la valeur du champ '${field}' existe déjà.`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Enregistrement introuvable.',
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur.',
  });
};

module.exports = errorHandler;
