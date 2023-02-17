const axios = require('axios');

const PROJECT_NAMES_URL =
  'https://idart.mot.com/rest/motojirarest/1.0/dbRestAPI/GetNPIprojectNames?_=1676614093269';

async function create(requestBody, authorization, url) {
  const { data } = await axios.post(`${url}/rest/api/2/issue`, requestBody, {
    headers: { Authorization: `${authorization}` },
  });

  return data;
}

async function getNpiProjectNames(authorization) {
  const { data } = await axios.get(PROJECT_NAMES_URL, {
    headers: { Authorization: authorization },
  });

  return data;
}

module.exports = { create, getNpiProjectNames };
