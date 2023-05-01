const { idartService } = require('../services');
const https = require('https');

let BASE_IDART_URL = '';

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-test.mot.com';
} else {
  BASE_IDART_URL = 'https://idart.mot.com';
}

async function getNpiProjectNames(req, res) {
  const { authorization } = req.headers;

  const npiProjectNames = await idartService.getNpiProjectNames(authorization);

  return res.status(200).json(npiProjectNames);
}

async function getRegionNames(req, res) {
  const { authorization } = req.headers;

  const regionNames = await idartService.getRegionNames(authorization);

  return res.status(200).json(regionNames);
}

async function getLaunchType(req, res) {
  const { authorization } = req.headers;

  const launchTypes = await idartService.getLaunchType(authorization);

  return res.status(200).json(launchTypes);
}

module.exports = { getNpiProjectNames, getRegionNames, getLaunchType };
