const express = require('express');
const rescue = require('express-rescue');
const { idartController } = require('../controllers');

const idartRouter = express.Router();

idartRouter.get('/npi-project-names', rescue(idartController.getNpiProjectNames));

idartRouter.get('/launch-types', rescue(idartController.getLaunchType));

idartRouter.get('/region-names', rescue(idartController.getRegionNames));

module.exports = idartRouter;
