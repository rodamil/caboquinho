import express from 'express';
import rescue from 'express-rescue';
import { svnkitController } from '../controllers';

const svnkitRouter = express.Router();

svnkitRouter.post('/create-svnkit', rescue(svnkitController.create));

export default svnkitRouter;
