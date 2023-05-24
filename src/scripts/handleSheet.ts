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

const updateSheet = async ({ url, svnkitLink, svnkitKey, range }) => {
  const spreadsheetId = url.split('/d/')[1].split('/')[0];
  const spreadsheetGid = url.split('gid=')[1];

  const auth = await getAuthToken();
  const spreadsheet = await getSpreadSheet({ auth, spreadsheetId });

  const currentSheets = spreadsheet.data.sheets;

  let sheetName;

  for (const sheet of currentSheets) {
    if (sheet.properties.sheetId === Number(spreadsheetGid)) {
      sheetName = sheet.properties.title;
    }
  }

  SHEETS.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: `${sheetName}!${range}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [[`=HYPERLINK("${svnkitLink}", "${svnkitKey}")`]] },
  });
};

module.exports = {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues,
  getSheet,
  updateSheet,
};
