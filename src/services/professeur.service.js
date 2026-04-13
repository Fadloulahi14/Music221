'use strict';
const BaseService = require('./base.service');
const professeurRepo = require('../repositories/professeur.repo');
const HttpError = require('../utils/httpError');

class ProfesseurService extends BaseService {
  constructor() {
    super(professeurRepo, 'Professeur');
  }

  async create(data) {
    const existing = await professeurRepo.findByEmail(data.email);
    if (existing) throw HttpError.conflict(`L'email '${data.email}' est déjà utilisé`);
    return professeurRepo.create(data);
  }

  async update(id, data) {
    await this.findById(id);
    if (data.email) {
      const existing = await professeurRepo.findByEmail(data.email);
      if (existing && existing.id !== id)
        throw HttpError.conflict(`L'email '${data.email}' est déjà utilisé`);
    }
    return professeurRepo.update(id, data);
  }

  async delete(id) {
    const prof = await professeurRepo.countCoursPlanifies(id);
    if (!prof) throw HttpError.notFound(`Professeur #${id} introuvable`);
    if (prof._count.cours > 0)
      throw HttpError.conflict(
        `Impossible de supprimer : le professeur a ${prof._count.cours} cours PLANIFIE(S)`
      );
    return professeurRepo.delete(id);
  }
}

module.exports = new ProfesseurService();
