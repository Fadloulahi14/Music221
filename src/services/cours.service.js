'use strict';
const BaseService = require('./base.service');
const coursRepo = require('../repositories/cours.repo');
const eleveRepo = require('../repositories/eleve.repo');
const professeurRepo = require('../repositories/professeur.repo');
const instrumentRepo = require('../repositories/instrument.repo');
const HttpError = require('../utils/httpError');

class CoursService extends BaseService {
  constructor() {
    super(coursRepo, 'Cours');
  }

  async create(data) {
    // 1. Vérifier existence élève
    const eleve = await eleveRepo.findById(data.eleveId);
    if (!eleve) throw HttpError.notFound(`Élève #${data.eleveId} introuvable`);

    // 2. Vérifier existence professeur
    const professeur = await professeurRepo.findById(data.professeurId);
    if (!professeur) throw HttpError.notFound(`Professeur #${data.professeurId} introuvable`);

    // 3. Vérifier existence instrument
    const instrument = await instrumentRepo.findById(data.instrumentId);
    if (!instrument) throw HttpError.notFound(`Instrument #${data.instrumentId} introuvable`);

    // 4. Vérifier que l'instrument est DISPONIBLE
    if (instrument.statut !== 'DISPONIBLE')
      throw HttpError.conflict(
        `L'instrument '${instrument.nom}' n'est pas disponible (statut: ${instrument.statut})`
      );

    // 5. Vérifier dateHeure dans le futur (déjà validé par Zod, double check)
    if (data.dateHeure <= new Date())
      throw HttpError.badRequest('La dateHeure doit être dans le futur');

    // 6. Vérifier conflit professeur
    const conflit = await coursRepo.findConflitProfesseur(data.professeurId, data.dateHeure);
    if (conflit)
      throw HttpError.conflict(
        `Le professeur a déjà un cours planifié à cette dateHeure (cours #${conflit.id})`
      );

    return coursRepo.create({ ...data, statut: 'PLANIFIE' });
  }

  async updateStatut(id, data) {
    const cours = await this.findById(id);
    if (cours.statut === 'ANNULE')
      throw HttpError.conflict('Un cours annulé ne peut pas être modifié');
    return coursRepo.update(id, { statut: data.statut });
  }

  async delete(id) {
    const cours = await this.findById(id);
    if (cours.statut === 'PLANIFIE')
      throw HttpError.conflict('Impossible de supprimer un cours avec statut PLANIFIE. Annulez-le d\'abord.');
    return coursRepo.delete(id);
  }
}

module.exports = new CoursService();
