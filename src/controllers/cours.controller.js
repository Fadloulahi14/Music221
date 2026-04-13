'use strict';
const BaseController = require('./base.controller');
const coursService = require('../services/cours.service');
const { success } = require('../utils/response');

class CoursController extends BaseController {
  constructor() {
    super(coursService, 'Cours');
    this.updateStatut = this.updateStatut.bind(this);
  }

  async updateStatut(req, res, next) {
    try {
      const data = await coursService.updateStatut(req.params.id, req.body);
      return success(res, data, 'Statut du cours mis à jour');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CoursController();
