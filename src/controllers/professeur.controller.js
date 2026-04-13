'use strict';
const BaseController = require('./base.controller');
const professeurService = require('../services/professeur.service');

class ProfesseurController extends BaseController {
  constructor() {
    super(professeurService, 'Professeur');
  }
}

module.exports = new ProfesseurController();
