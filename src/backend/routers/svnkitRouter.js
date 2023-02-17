const express = require('express');
const rescue = require('express-rescue');
const { svnkitController } = require('../controllers');

const svnkitRouter = express.Router();

svnkitRouter.post('/create-svnkit', rescue(svnkitController.create));

svnkitRouter.get(
  '/npi-project-names',
  rescue(svnkitController.getNpiProjectNames),
);

module.exports = svnkitRouter;
