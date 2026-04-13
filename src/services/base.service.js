'use strict';
const HttpError = require('../utils/httpError');

class BaseService {
  constructor(repository, entityName) {
    this.repository = repository;
    this.entityName = entityName;
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id) {
    const entity = await this.repository.findById(id);
    if (!entity) throw HttpError.notFound(`${this.entityName} #${id} introuvable`);
    return entity;
  }

  async delete(id) {
    await this.findById(id);
    return this.repository.delete(id);
  }
}

module.exports = BaseService;
