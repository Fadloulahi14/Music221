'use strict';
const BaseController = require('./base.controller');
const instrumentService = require('../services/instrument.service');

class InstrumentController extends BaseController {
  constructor() {
    super(instrumentService, 'Instrument');
  }
}

module.exports = new InstrumentController();
