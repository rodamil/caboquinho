const express = require('express');
const { userController } = require('../controllers');
const rescue = require('express-rescue');
const userRouter = express.Router();

userRouter.post('/login', rescue(userController.makeLogin));

module.exports = userRouter;
