const axios = require('axios');

async function getXml(authorization, xmlUrl) {
  const { data } = await axios.get(xmlUrl, {
    headers: { Authorization: `${authorization}` },
  });

  return data;
}

async function create(authorization, requestBody, url) {
  const { data } = await axios.post(`${url}/rest/api/2/issue`, requestBody, {
    headers: { Authorization: `${authorization}` },
  });

  return data;
}

module.exports = { create, getXml };
