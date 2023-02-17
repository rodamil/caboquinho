const axios = require('axios');

async function create(requestBody, authorization, url) {
  const { data } = await axios.post(`${url}/rest/api/2/issue`, requestBody, {
    headers: { Authorization: `Basic ${authorization}` },
  });

  return data;
}

module.exports = { create };
