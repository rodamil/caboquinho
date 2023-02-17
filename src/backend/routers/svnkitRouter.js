const express = require('express');
const { svnkitController } = require('../controllers');

const svnkitRouter = express.Router();

svnkitRouter.post('/create-svnkit', svnkitController.create);

module.exports = svnkitRouter;
