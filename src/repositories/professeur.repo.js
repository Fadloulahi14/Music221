'use strict';
const BaseRepository = require('./base.repo');

class ProfesseurRepository extends BaseRepository {
  constructor() {
    super('professeur');
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
      include: { cours: { include: { eleve: true, instrument: true } } },
    });
  }

  async countCoursPlanifies(professeurId) {
    return this.model.findUnique({
      where: { id: professeurId },
      include: {
        _count: { select: { cours: { where: { statut: 'PLANIFIE' } } } },
      },
    });
  }
}

module.exports = new ProfesseurRepository();
