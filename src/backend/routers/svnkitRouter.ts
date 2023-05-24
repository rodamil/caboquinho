const express = require('express');
const rescue = require('express-rescue');
const { svnkitController } = require('../controllers');

const svnkitRouter = express.Router();

svnkitRouter.post('/create-svnkit', rescue(svnkitController.create));

module.exports = svnkitRouter;
