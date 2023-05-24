const axios = require('axios');

async function getXml(authorization, xmlUrl) {
  const { data } = await axios.get(xmlUrl, {
    headers: { Authorization: `${authorization}` },
  });

  return data;
}

module.exports = { getXml };
