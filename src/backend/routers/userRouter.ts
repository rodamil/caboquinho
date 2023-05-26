import express from 'express';
import rescue from 'express-rescue';
import { userController } from '../controllers';

const userRouter = express.Router();

userRouter.post('/login', rescue(userController.makeLogin));

export default userRouter;
