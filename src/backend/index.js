require('dotenv').config();
const express = require('express');
const rescue = require('express-rescue');
const { svnkitRouter, userRouter } = require('./routers');
const errorMiddleware = require('./middlewares/errorMiddleware');
const idartRouter = require('./routers/idartRouter');
const app = express();
app.use(express.json());

const port = process.env.PORT || 3001;

app.use('/', userRouter);

app.use('/', rescue(svnkitRouter));

app.use('/', rescue(idartRouter));

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
