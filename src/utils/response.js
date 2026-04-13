'use strict';

const success = (res, data, message = 'Succès', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const created = (res, data, message = 'Créé avec succès') => {
  return success(res, data, message, 201);
};

const noContent = (res) => {
  return res.status(204).send();
};

module.exports = { success, created, noContent };
