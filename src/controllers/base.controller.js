'use strict';
const { success, created, noContent } = require('../utils/response');

class BaseController {
  constructor(service, entityName) {
    this.service = service;
    this.entityName = entityName;

    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findAll(req, res, next) {
    try {
      const data = await this.service.findAll();
      return success(res, data, `Liste des ${this.entityName}s récupérée`);
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const data = await this.service.findById(req.params.id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const data = await this.service.create(req.body);
      return created(res, data, `${this.entityName} créé(e) avec succès`);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const data = await this.service.update(req.params.id, req.body);
      return success(res, data, `${this.entityName} mis(e) à jour`);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await this.service.delete(req.params.id);
      return noContent(res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BaseController;
