import dotenv from 'dotenv';
import express from 'express';
import rescue from 'express-rescue';
import errorMiddleware from './middlewares/errorMiddleware';
import { dpmRouter, idartRouter, svnkitRouter, userRouter } from './routers';

dotenv.config();
const app = express();
app.use(express.json());

const port = process.env.PORT || 3001;

app.use('/', userRouter);

app.use('/', rescue(svnkitRouter));

app.use('/', rescue(idartRouter));

app.use('/', rescue(dpmRouter));

app.use(errorMiddleware);

app.get(
  '/',
  rescue(async (_req, res) => {
    return res.status(200).json({ message: 'Ok' });
  }),
);

app.listen(port, () => {
  console.log(`Linstening on port ${port}`);
});

module.exports = app;
