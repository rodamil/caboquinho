const axios = require('axios');
const { getSheet } = require('./handleSheet');
const { capitalizeFirstLetter } = require('./utils');

const serverUrl = process.env.BASE_SERVER_URL || 'http://localhost:';
const serverPort = process.env.PORT || 3001;

const TAM_NAMES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1580787348';
const LANGUAGES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1141640823';
const CHANNEL_IDS_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1936494592';
const JSVNKIT_CARRIERS_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=345728287';
const EUROPE_ROCARRIERS_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1986360011';

const DPM_DAY_RULES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=300192935';

const DPM_UPDATE_RULES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1553398430';

const DPM_MULTCONFIG_RULES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1664036455';

async function getTamNames() {
  const COUNTRY_POSITION = 1;
  const CARRIER_POSITION = 2;
  const TAM_COREID_POSITION = 7;
  const tamSheet = await getSheet(TAM_NAMES_URL);
  const [_titles, ...rowsData] = tamSheet.data.values;
  const tamsByCarrierCountry = [];

  for (const row of rowsData) {
    tamsByCarrierCountry.push({
      carrierCountry: `${row[CARRIER_POSITION].trim()} ${row[COUNTRY_POSITION].trim()}`,
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
  try {
    const token = localStorage.getItem('token');

    const { data } = await axios.get(`${serverUrl}${serverPort}/npi-project-names`, {
      headers: { Authorization: token },
    });

    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function getRegionNames() {
  try {
    const token = localStorage.getItem('token');

    const { data } = await axios.get(`${serverUrl}${serverPort}/region-names`, {
      headers: { Authorization: token },
    });

    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function getLaunchTypes() {
  try {
    const token = localStorage.getItem('token');

    const { data } = await axios.get(`${serverUrl}${serverPort}/launch-types`, {
      headers: { Authorization: token },
    });

    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
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

async function getDpmDayRules() {
  const dpmDayRules = await getSheet(DPM_DAY_RULES_URL);

  const dayRulesFormated = {};

  dpmDayRules.data.values.forEach((row, index) => {
    if (index > 0) {
      const [day] = row[3].split(' ');
      // https://bobbyhadz.com/blog/javascript-remove-all-line-breaks-from-string
      const countries = row[0].replace(/[\r\n]/gm, ' ').split(' ');
      const splitedCountries = [];

      for (const country of countries) {
        if (country.trim()) {
          splitedCountries.push(country.trim());
        }
      }

      const existentList = dayRulesFormated[day];

      if (existentList) {
        dayRulesFormated[day] = [...existentList, ...splitedCountries];
      } else {
        dayRulesFormated[day] = splitedCountries;
      }
    }
  });

  return dayRulesFormated;
}

async function getDpmUpdateRules() {
  const dpmUpdateRules = await getSheet(DPM_UPDATE_RULES_URL);
  const updateRulesFormated = {};

  dpmUpdateRules.data.values.forEach((row, index) => {
    if (index > 0) {
      const currRocarrier = row[3];
      const currLanguage = row[4];

      updateRulesFormated[currRocarrier] = {
        language: currLanguage,
        SMR: {
          forcedUpgrade: capitalizeFirstLetter(row[6]),
          downdloadWifiOnly: capitalizeFirstLetter(row[7]),
          showPreDownloadMsg: capitalizeFirstLetter(row[8]),
          showDownloadOptions: capitalizeFirstLetter(row[9]),
        },
        MR: {
          forcedUpgrade: capitalizeFirstLetter(row[10]),
          downdloadWifiOnly: capitalizeFirstLetter(row[11]),
          showPreDownloadMsg: capitalizeFirstLetter(row[12]),
          showDownloadOptions: capitalizeFirstLetter(row[13]),
        },
      };
    }
  });

  return updateRulesFormated;
}

async function getMultiConfigRules(url) {
  const dpmMultConfigRules = await getSheet(url || DPM_MULTCONFIG_RULES_URL);
  const multiConfigRulesFormated = {};

  dpmMultConfigRules.data.values.forEach((row, index) => {
    if (index > 0) {
      const groupTitle = row[0];

      multiConfigRulesFormated[groupTitle] = {
        groupCarriers: row[1],
      };
    }
  });

  return multiConfigRulesFormated;
}

module.exports = {
  getTamNames,
  getLanguages,
  getChannelIds,
  getProjectNames,
  getRegionNames,
  getJsvnkitCarriers,
  getDpmDayRules,
  getDpmUpdateRules,
  getMultiConfigRules,
  getLaunchTypes,
};
