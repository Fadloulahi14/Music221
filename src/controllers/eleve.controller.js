'use strict';
const BaseController = require('./base.controller');
const eleveService = require('../services/eleve.service');

class EleveController extends BaseController {
  constructor() {
    super(eleveService, 'Élève');
  }
}

module.exports = new EleveController();
