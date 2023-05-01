const axios = require('axios');

const PROJECT_NAMES_URL =
  'https://idart.mot.com/rest/motojirarest/1.0/dbRestAPI/GetNPIprojectNames';

const REGION_NAMES_URL =
  'https://idart.mot.com/rest/motojirarest/1.0/dbRestAPI/GetNPIRegions';

const LAUNCH_TYPE_URL =
  'https://idart.mot.com/rest/motojirarest/1.0/dbRestAPI/GetNPILaunchType';

async function getNpiProjectNames(authorization) {
  const { data } = await axios.get(PROJECT_NAMES_URL, {
    headers: { Authorization: authorization },
  });

  return data;
}

async function getRegionNames(authorization) {
  const { data } = await axios.get(REGION_NAMES_URL, {
    headers: { Authorization: authorization },
  });

  return data;
}

async function getLaunchType(authorization) {
  const { data } = await axios.get(LAUNCH_TYPE_URL, {
    headers: { Authorization: authorization },
  });

  return data;
}

module.exports = { getRegionNames, getLaunchType, getNpiProjectNames };
