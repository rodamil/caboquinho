const express = require('express');
const rescue = require('express-rescue');
const { dpmController } = require('../controllers');

const dpmRouter = express.Router();

dpmRouter.post('/create-dpm', rescue(dpmController.create));

module.exports = dpmRouter;
