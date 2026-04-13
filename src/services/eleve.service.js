'use strict';
const BaseService = require('./base.service');
const eleveRepo = require('../repositories/eleve.repo');
const HttpError = require('../utils/httpError');

class EleveService extends BaseService {
  constructor() {
    super(eleveRepo, 'Élève');
  }

  async create(data) {
    const existing = await eleveRepo.findByEmail(data.email);
    if (existing) throw HttpError.conflict(`L'email '${data.email}' est déjà utilisé`);
    return eleveRepo.create(data);
  }

  async update(id, data) {
    await this.findById(id);
    if (data.email) {
      const existing = await eleveRepo.findByEmail(data.email);
      if (existing && existing.id !== id)
        throw HttpError.conflict(`L'email '${data.email}' est déjà utilisé`);
    }
    return eleveRepo.update(id, data);
  }

  async delete(id) {
    await this.findById(id);
    const hasCours = await eleveRepo.hasCours(id);
    if (hasCours)
      throw HttpError.conflict("Impossible de supprimer : l'élève possède des cours associés");
    return eleveRepo.delete(id);
  }
}

module.exports = new EleveService();
