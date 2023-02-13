require('dotenv').config();
const express = require('express');
const rescue = require('express-rescue');
const axios = require('axios');
const https = require('https');

const app = express();
app.use(express.json());

const SVNKIT_PROJECT_ID = '19280';
const SVNKIT_ISSUE_TYPE_ID = '108';
let BASE_IDART_URL = '';

const port = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-dev.mot.com';
} else {
  BASE_IDART_URL = 'https://idart.mot.com';
}

app.get(
  '/',
  rescue(async (_req, res) => {
    return res.status(200).json({ message: 'Ok' });
  }),
);

app.post(
  '/login',
  rescue(async (req, res) => {
    const { username, password } = req.body;

    const { data } = await axios.post(`${BASE_IDART_URL}/rest/auth/1/session`, {
      username,
      password,
    });

    return res.status(200).json(data);
  }),
);

app.post(
  '/create-svnkit',
  rescue(async (req, res) => {
    const { svnkitData } = req.body;
    const { authorization } = req.headers;

    const isDualSim = svnkitData['SS / DS'] === 'DS';
    const hasESIM = svnkitData['ESIM'] === 'TRUE';

    let dualSimField = '47545'; // false
    let simCardSlotsField = 'psim';

    if (isDualSim) {
      dualSimField = '47544'; //true

      if (hasESIM) {
        simCardSlotsField = 'psim + esim';
      } else {
        simCardSlotsField = 'psim + psim';
      }
    }

    const myRequestBody = {
      fields: {
        project: { id: SVNKIT_PROJECT_ID },
        issuetype: { id: SVNKIT_ISSUE_TYPE_ID },
        summary: `${svnkitData['CARRIER COUNTRY']}: New SVN Kit request for ${svnkitData['MODEL']} ${svnkitData['PROJECT NAME']}`,
        description: svnkitData['DESCRIPTION'].split('\\').join('\n'),
        customfield_14810: svnkitData['PROJECT NAME'],
        customfield_14811: svnkitData['MODEL'],
        customfield_10407: { value: svnkitData['CARRIER COUNTRY'] },
        customfield_14813: `${svnkitData['PROJECT NAME']} ${svnkitData['SS / DS']} ${svnkitData['MODEL']}`,
        customfield_16112: svnkitData['CHANNEL ID'],
        customfield_16113: svnkitData['RO.CARRIER'],
        customfield_14825: svnkitData['SOFTWARE TA'],
        customfield_22021: svnkitData['SOFTWARE TA'],
        customfield_24713: { id: dualSimField },
        customfield_25528: { value: simCardSlotsField },
        customfield_14827: svnkitData['FINGERPRINT'],
        customfield_14828: svnkitData['BOOTLOADER'],
        customfield_14831: { name: svnkitData['TAM'] },
        customfield_14821: [{ name: svnkitData['PRODUCT MANAGER'] }],
        customfield_14832: { value: 'No' },
        customfield_14833: { value: 'CFC' },
        customfield_13316: `No||CFC||${svnkitData['SIGNED']}|| ||SOFTWARE ${svnkitData['MODEL']} ${svnkitData['CARRIER COUNTRY']} ${svnkitData['SOFTWARE TA']} CFC|| || || || ||\nNo||MBN||a|| ||a|| || || || ||\nNo||RAMLoader||aa|| ||aa|| || || || ||`,
        customfield_24714: { value: svnkitData['LANGUAGE'] },
      },
    };

    const { data } = await axios.post(
      `${BASE_IDART_URL}/rest/api/2/issue`,
      myRequestBody,
      {
        headers: {
          Authorization: `Basic ${authorization}`,
        },
      },
    );

    return res.status(201).json(data);
  }),
);

app.use((err, _req, res, _next) => {
  try {
    const message = err.message;
    const status = err.response.status;
    const errors = err.response.data.errors;

    return res.status(status).json({ errors, message, status });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e.message,
      errors: { message: e.message },
      status: 500,
    });
  }
});

app.listen(port, () => {
  console.log(`Linstening on port ${port}`);
});

module.exports = app;
