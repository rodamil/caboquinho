const { getSheet } = require('./handleSheet');

const TAM_NAMES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1580787348';
const LANGUAGES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1141640823';
const CHANNEL_IDS_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1936494592';
const PROJECT_NAMES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=72983640';
const JSVNKIT_CARRIERS_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=345728287';
const EUROPE_ROCARRIERS_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1986360011';

async function getTamNames() {
  const COUNTRY_POSITION = 1;
  const CARRIER_POSITION = 2;
  const TAM_COREID_POSITION = 7;
  const tamSheet = await getSheet(TAM_NAMES_URL);
  const [_titles, ...rowsData] = tamSheet.data.values;
  const tamsByCarrierCountry = [];

  for (const row of rowsData) {
    tamsByCarrierCountry.push({
      carrierCountry: `${row[CARRIER_POSITION].trim()} ${row[
        COUNTRY_POSITION
      ].trim()}`,
      coreId: row[TAM_COREID_POSITION].trim(),
    });
  }

  return tamsByCarrierCountry;
}

async function getLanguages() {
  const ROCARRIER_POSITION = 0;
  const LANGUAGE_POSITION = 1;

  const languageSheet = await getSheet(LANGUAGES_URL);
  const [_titles, ...rowsData] = languageSheet.data.values;
  const languagesAndRocarrier = [];

  for (const row of rowsData) {
    languagesAndRocarrier.push({
      rocarrier: row[ROCARRIER_POSITION].trim(),
      language: row[LANGUAGE_POSITION].trim(),
    });
  }

  return languagesAndRocarrier;
}

async function getEuropeRocarriers() {
  const europeRocarriersSheet = await getSheet(EUROPE_ROCARRIERS_URL);
  const rowsData = europeRocarriersSheet.data.values;
  const europeRocarriers = [];

  for (const row of rowsData) {
    europeRocarriers.push(row[0].trim());
  }

  return europeRocarriers;
}

async function getChannelIds() {
  const CHANNELID_POSITION = 0;
  const ROCARRIER_POSITION = 1;
  const rocarrierExceptions = await getEuropeRocarriers();

  const channelsSheet = await getSheet(CHANNEL_IDS_URL);
  const [_titles, ...rowsData] = channelsSheet.data.values;
  const channelIdsByRocarrier = [];

  for (const row of rowsData) {
    const currentChannelId = row[CHANNELID_POSITION].trim();
    const currentRocarrier = row[ROCARRIER_POSITION].trim();
    let formatedChannelId = '';

    const areAnException = rocarrierExceptions.find(
      (carrier) => carrier === currentRocarrier,
    );

    if (areAnException) {
      formatedChannelId = '0x00';
    } else {
      formatedChannelId = `0x${currentChannelId}`;
    }

    channelIdsByRocarrier.push({
      rocarrier: currentRocarrier,
      channelId: formatedChannelId,
    });
  }

  return channelIdsByRocarrier;
}

async function getProjectNames() {
  const projectNamesSheet = await getSheet(PROJECT_NAMES_URL);
  const rowsData = projectNamesSheet.data.values;
  const projectNames = [];

  for (const row of rowsData) {
    projectNames.push(row[0].trim());
  }

  return projectNames;
}

async function getJsvnkitCarriers() {
  const jsvnkitCarriersSheet = await getSheet(JSVNKIT_CARRIERS_URL);
  const rowsData = jsvnkitCarriersSheet.data.values;
  const jsvnkitCarriers = [];

  for (const row of rowsData) {
    jsvnkitCarriers.push(row[0].trim());
  }

  return jsvnkitCarriers;
}

module.exports = {
  getTamNames,
  getLanguages,
  getChannelIds,
  getProjectNames,
  getJsvnkitCarriers,
};
