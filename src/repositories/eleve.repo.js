'use strict';
const BaseRepository = require('./base.repo');

class EleveRepository extends BaseRepository {
  constructor() {
    super('eleve');
  }

  async findAll() {
    return this.model.findMany({ orderBy: { nom: 'asc' } });
  }

  async findByEmail(email) {
    return this.model.findUnique({ where: { email } });
  }

  async findById(id) {
    return this.model.findUnique({
      where: { id },
      include: { cours: { include: { professeur: true, instrument: true } } },
    });
  }

  async hasCours(eleveId) {
    const count = await this.model.count({
      where: { id: eleveId, cours: { some: {} } },
    });
    return count > 0;
  }
}

module.exports = new EleveRepository();
