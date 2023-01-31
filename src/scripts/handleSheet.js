const { google } = require('googleapis');
const CREDENTIALS = require('../auth/credentials.json');

const SHEETS = google.sheets('v4');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    credentials: CREDENTIALS,
  });

  return auth.getClient();
}

async function getSpreadSheet({ spreadsheetId, auth }) {
  return SHEETS.spreadsheets.get({ spreadsheetId, auth });
}

async function getSpreadSheetValues({ spreadsheetId, auth, sheetName }) {
  return SHEETS.spreadsheets.values.get({
    spreadsheetId,
    auth,
    range: sheetName,
  });
}

const getSheet = async (url) => {
  const spreadsheetId = url.split('/d/')[1].split('/')[0];
  const spreadsheetGid = url.split('gid=')[1];

  const auth = await getAuthToken();

  const spreadsheet = await getSpreadSheet({ auth, spreadsheetId });

  const currentSheets = spreadsheet.data.sheets;

  let currentSheet;

  for (const sheet of currentSheets) {
    if (sheet.properties.sheetId === Number(spreadsheetGid)) {
      currentSheet = await getSpreadSheetValues({
        auth,
        spreadsheetId,
        sheetName: sheet.properties.title,
      });
    }
  }

  return currentSheet;
};

// sheets.spreadsheets.values.update({
//   auth,
//   spreadsheetId,
//   range: `Submission Control [MR8]!A2`,
//   valueInputOption: 'RAW',
//   resource: { values: [['Build Name']] },
// });
// getSheet(
//   'https://docs.google.com/spreadsheets/d/1jR8wp40UGFRSebgMoYk6KhhI6lEGAM2H9QpEsKoTCHI/edit#gid=1301952764',
// );

module.exports = {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues,
  getSheet,
};
