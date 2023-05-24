const axios = require('axios');
const https = require('https');

let BASE_IDART_URL = '';

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-test.mot.com/browse';
} else {
  BASE_IDART_URL = 'https://idart.mot.com/browse';
}

const serverUrl = process.env.BASE_SERVER_URL || 'http://localhost:';
const serverPort = process.env.PORT || 3001;

async function createControlCr(controlCrData, token) {
  console.log(controlCrData);
  try {
    const { data } = await axios.post(
      `${serverUrl}${serverPort}/control-cr`,
      { controlCrData },
      { headers: { Authorization: token } },
    );

    return data;
  } catch (e) {
    console.table(controlCrData);

    return '';
  }
}

module.exports = { createControlCr };
