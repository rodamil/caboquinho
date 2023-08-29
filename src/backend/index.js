require('dotenv').config();
const express = require('express');
const rescue = require('express-rescue');
const {
  svnkitRouter,
  userRouter,
  idartRouter,
  dpmRouter,
} = require('./routers');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
app.use(express.json());

const port = process.env.PORT || 0;

app.use('/', userRouter);

app.use('/', rescue(svnkitRouter));

app.use('/', rescue(idartRouter));

app.use('/', rescue(dpmRouter));

app.use(errorMiddleware);

app.get(
  '/',
  rescue(async (_req, res) => {
    return res.status(200).json({ message: 'Ok' });
  })
);

const server = app.listen(port, () => {
  const actualPort = server.address().port;

  process.env.PORT = actualPort;

  console.log(`Server is running on port ${actualPort}`);
});

module.exports = app;
