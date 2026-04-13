'use strict';
const BaseService = require('./base.service');
const instrumentRepo = require('../repositories/instrument.repo');
const HttpError = require('../utils/httpError');

class InstrumentService extends BaseService {
  constructor() {
    super(instrumentRepo, 'Instrument');
  }

  async create(data) {
    const existing = await instrumentRepo.findByCode(data.code);
    if (existing) throw HttpError.conflict(`Le code '${data.code}' est déjà utilisé`);
    return instrumentRepo.create(data);
  }

  async update(id, data) {
    await this.findById(id);
    if (data.code) {
      const existing = await instrumentRepo.findByCode(data.code);
      if (existing && existing.id !== id)
        throw HttpError.conflict(`Le code '${data.code}' est déjà utilisé`);
    }
    return instrumentRepo.update(id, data);
  }

  async delete(id) {
    const instr = await instrumentRepo.countCoursPlanifies(id);
    if (!instr) throw HttpError.notFound(`Instrument #${id} introuvable`);
    if (instr._count.cours > 0)
      throw HttpError.conflict(
        `Impossible de supprimer : l'instrument a ${instr._count.cours} cours PLANIFIE(S)`
      );
    return instrumentRepo.delete(id);
  }
}

module.exports = new InstrumentService();
