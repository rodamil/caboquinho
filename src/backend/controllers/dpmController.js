const { dpmService } = require('../services');
const https = require('https');

let BASE_IDART_URL = '';

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-test.mot.com';
} else {
  BASE_IDART_URL = 'https://idart.mot.com';
}

async function create(req, res) {
  const { dpmData } = req.body;
  const { authorization } = req.headers;

  const kitCreated = await dpmService.create(dpmData, authorization, BASE_IDART_URL);

  return res.status(201).json(kitCreated);
}

module.exports = { create };
