'use strict';
const BaseRepository = require('./base.repo');

class CoursRepository extends BaseRepository {
  constructor() {
    super('cours');
  }

  async findAll() {
    return this.model.findMany({
      orderBy: { dateHeure: 'asc' },
      include: {
        eleve: true,
        professeur: true,
        instrument: true,
      },
    });
  }

  async findById(id) {
    return this.model.findUnique({
      where: { id },
      include: { eleve: true, professeur: true, instrument: true },
    });
  }

  async findConflitProfesseur(professeurId, dateHeure, excludeId = null) {
    const where = {
      professeurId,
      dateHeure,
      statut: { not: 'ANNULE' },
    };
    if (excludeId) where.id = { not: excludeId };
    return this.model.findFirst({ where });
  }

  async create(data) {
    return this.model.create({
      data,
      include: { eleve: true, professeur: true, instrument: true },
    });
  }

  async update(id, data) {
    return this.model.update({
      where: { id },
      data,
      include: { eleve: true, professeur: true, instrument: true },
    });
  }
}

module.exports = new CoursRepository();
