'use strict';

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }

  static badRequest(message) {
    return new HttpError(400, message);
  }

  static notFound(message = 'Ressource introuvable') {
    return new HttpError(404, message);
  }

  static conflict(message) {
    return new HttpError(409, message);
  }

  static unprocessable(message) {
    return new HttpError(422, message);
  }

  static internal(message = 'Erreur interne du serveur') {
    return new HttpError(500, message);
  }
}

module.exports = HttpError;
