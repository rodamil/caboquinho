import express from 'express';
import rescue from 'express-rescue';
import { idartController } from '../controllers';

const idartRouter = express.Router();

idartRouter.get('/npi-project-names', rescue(idartController.getNpiProjectNames));

idartRouter.get('/launch-types', rescue(idartController.getLaunchType));

idartRouter.get('/region-names', rescue(idartController.getRegionNames));

idartRouter.post('/control-cr', rescue(idartController.createControlCr));

export default idartRouter;
