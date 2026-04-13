'use strict';
const prisma = require('../config/db');

class BaseRepository {
  constructor(modelName) {
    this.model = prisma[modelName];
  }

  async findAll(options = {}) {
    return this.model.findMany(options);
  }

  async findById(id, options = {}) {
    return this.model.findUnique({ where: { id }, ...options });
  }

  async create(data) {
    return this.model.create({ data });
  }

  async update(id, data) {
    return this.model.update({ where: { id }, data });
  }

  async delete(id) {
    return this.model.delete({ where: { id } });
  }

  async count(where = {}) {
    return this.model.count({ where });
  }
}

module.exports = BaseRepository;
