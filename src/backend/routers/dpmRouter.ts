import express from 'express';
import rescue from 'express-rescue';
import { dpmController } from '../controllers';

const dpmRouter = express.Router();

dpmRouter.post('/create-dpm', rescue(dpmController.create));

export default dpmRouter;
