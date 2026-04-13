'use strict';
const router = require('express').Router();

router.use('/professeurs', require('./professeur.routes'));
router.use('/eleves', require('./eleve.routes'));
router.use('/instruments', require('./instrument.routes'));
router.use('/cours', require('./cours.routes'));

module.exports = router;
