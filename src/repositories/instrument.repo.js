'use strict';
const BaseRepository = require('./base.repo');

class InstrumentRepository extends BaseRepository {
  constructor() {
    super('instrument');
  }

  async findAll() {
    return this.model.findMany({ orderBy: { nom: 'asc' } });
  }

  async findByCode(code) {
    return this.model.findUnique({ where: { code } });
  }

  async findById(id) {
    return this.model.findUnique({
      where: { id },
      include: { cours: { include: { eleve: true, professeur: true } } },
    });
  }

  async countCoursPlanifies(instrumentId) {
    return this.model.findUnique({
      where: { id: instrumentId },
      include: {
        _count: { select: { cours: { where: { statut: 'PLANIFIE' } } } },
      },
    });
  }
}

module.exports = new InstrumentRepository();
