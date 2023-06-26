const axios = require('axios');
const https = require('https');
const { updateSheet } = require('./handleSheet');
const { formatString } = require('./utils');

let BASE_IDART_URL = '';

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-test.mot.com/browse';
} else {
  BASE_IDART_URL = 'https://idart.mot.com/browse';
}

const serverUrl = process.env.BASE_SERVER_URL || 'http://localhost:';
const serverPort = process.env.PORT || 3001;
const subsidyOffTypes = ['NO', '', 'Off'];

async function createSvnkit(rowData, token) {
  try {
    const { data } = await axios.post(
      `${serverUrl}${serverPort}/create-svnkit`,
      { svnkitData: rowData },
      { headers: { Authorization: token } },
    );

    return data;
  } catch (e) {
    console.table(rowData);

    return '';
  }
}

async function updateSvnkitFieldInWB({
  titlePositions,
  kitCreatedData,
  wbLink,
  worksheet,
}) {
  const rowsData = worksheet.data.values;

  const columnIndexToLetter = (index) =>
    (a = Math.floor(index / 26)) >= 0
      ? columnIndexToLetter(a - 1) + String.fromCharCode(65 + (index % 26))
      : ''; // Ref: https://stackoverflow.com/a/53678158

  const svnkitKey = kitCreatedData.svnkit;
  const columnIndex = columnIndexToLetter(titlePositions['SVNKIT']);
  for (const [rowNumber, rowData] of rowsData.entries()) {
    const target = formatString(rowData[titlePositions['SOFTWARE TA']]);
    const elabel = formatString(rowData[titlePositions['E-LABEL FILE']]);
    const rocarrier = formatString(rowData[titlePositions['RO.CARRIER']]);
    const model = formatString(rowData[titlePositions['MODEL']]);
    let subsidy = formatString(rowData[titlePositions['SUBSIDY LOCK']]);

    const checkTarget = formatString(kitCreatedData['SOFTWARE TA']) === target;
    const checkElabel = formatString(kitCreatedData['E-LABEL FILE']) === elabel;
    const checkRocarrier = formatString(kitCreatedData['RO.CARRIER']) === rocarrier;
    const checkModel = formatString(kitCreatedData['MODEL']) === model;

    if (subsidyOffTypes.includes(subsidy.toUpperCase())) {
      subsidy = 'Off';
    }

    const checkSubsidy = kitCreatedData['SUBSIDY LOCK'] === subsidy;
    if (checkTarget && checkElabel && checkRocarrier && checkModel && checkSubsidy) {
      updateSheet({
        url: wbLink,
        svnkitKey,
        svnkitLink: `${BASE_IDART_URL}/${svnkitKey}`,
        range: `${columnIndex}${rowNumber + 1}`,
      });
    }
  }
}

function getRowsData({
  wbRows,
  titlePositions,
  tamNamesData,
  languagesData,
  channelIdsData,
  jsvnkitCarriersData,
  productManager,
}) {
  const dataForTable = [];

  for (const row of wbRows) {
    const currentContent = {};

    const carrier = formatString(row[titlePositions['CARRIER']]);
    const country = formatString(row[titlePositions['COUNTRY']]);
    const carrierCountry = `${carrier} ${country}`;
    let rocarrier = '';

    if (country.toUpperCase() === 'BRAZIL') {
      rocarrier = 'retbr';
    } else {
      rocarrier = formatString(row[titlePositions['RO.CARRIER']]);
    }

    let subsidy = formatString(row[titlePositions['SUBSIDY LOCK']]);

    if (subsidyOffTypes.includes(subsidy.toUpperCase())) {
      subsidy = 'Off';
    }

    currentContent['PRODUCT MANAGER'] = productManager;
    currentContent['ESIM'] = '';
    currentContent['PROJECT NAME'] = '';
    currentContent['SVNKIT'] = '';

    currentContent['TAM'] = '';
    currentContent['LANGUAGE'] = '';
    currentContent['CHANNEL ID'] = '';

    for (const tam of tamNamesData) {
      if (tam.carrierCountry.toUpperCase() == carrierCountry.toUpperCase()) {
        currentContent['TAM'] = tam.coreId;
        break;
      }
    }

    for (const language of languagesData) {
      if (language.rocarrier.toUpperCase() == rocarrier.toUpperCase()) {
        currentContent['LANGUAGE'] = language.language;
        break;
      }
    }

    for (const channelId of channelIdsData) {
      if (channelId.rocarrier.toUpperCase() == rocarrier.toUpperCase()) {
        currentContent['CHANNEL ID'] = channelId.channelId;
        break;
      }
    }

    const isCarrierCountryInList = jsvnkitCarriersData.find(
      (current) => current === carrierCountry,
    );

    if (isCarrierCountryInList) {
      currentContent['CARRIER COUNTRY'] = carrierCountry;
    } else {
      currentContent['CARRIER COUNTRY'] = '';
    }

    for (const title in titlePositions) {
      const currentCell = formatString(row[titlePositions[title]]);

      if (title === 'RO.CARRIER') {
        currentContent[title] = rocarrier;
      } else if (title === 'SUBSIDY LOCK') {
        currentContent[title] = subsidy;
      } else {
        currentContent[title] = currentCell;
      }
    }

    dataForTable.push(currentContent);
  }

  return dataForTable;
}

const compareToCheck = ({ compareData, rocarrier, target, elabel, subsidy, model }) =>
  rocarrier == compareData['RO.CARRIER'] &&
  target == compareData['SOFTWARE TA'] &&
  elabel == compareData['E-LABEL FILE'] &&
  subsidy == compareData['SUBSIDY LOCK'] &&
  model == compareData['MODEL'];

function setDescriptionAndSwVersion(rowsWithData, company) {
  for (const rowData of rowsWithData) {
    // SW Version
    const fingerprint = rowData['FINGERPRINT'];
    const [fingerprintP1, fingerprintP2] = fingerprint.split(':');

    let product = fingerprintP1.split('/')[1];

    if (product.includes('_retail')) {
      product = `${product.split('retail')[0].trim()} retail`;
    } else {
      product = product.split('_')[0];
    }

    const [androidVersion, build, auxHash] = fingerprintP2.split('/');

    const hash = auxHash.split(':')[0];
    const swVersion = `${product}-user ${androidVersion} ${build} ${hash} release-keys`;

    rowData['SW VERSION'] = swVersion;

    // Description
    const target = rowData['SOFTWARE TA'];
    const elabel = rowData['E-LABEL FILE'];
    const rocarrier = rowData['RO.CARRIER'];
    const subsidy = rowData['SUBSIDY LOCK'];
    const ssDS = rowData['SS / DS'];
    const model = rowData['MODEL'];

    let description = `Build Fingerprint: ${fingerprint}\\`;
    description += `Build Id: ${target}\\`;
    description += `e-Label: ${elabel}\\`;

    if (company !== 'huaqin') {
      description += `Carrier: ${rocarrier}\\`;
    }

    description += `SIM Lock: ${subsidy}\\`;
    description += `DDS/SS: ${ssDS}\\`;
    description += `SW Version: ${swVersion}\\`;

    if (company != 'huaqin') {
      if (company === 'longcheer') {
        description += `||Carrier (Customer + Country)||ro.carrier||\\`;
      } else {
        description += `||Carrier (Customer + Country)||ro.carrier.${company.toLowerCase()}||\\`;
      }

      for (const compareData of rowsWithData) {
        if (
          compareToCheck({
            compareData,
            rocarrier,
            target,
            elabel,
            subsidy,
            model,
          })
        ) {
          const carrierCountry = `${compareData['CARRIER']} ${compareData['COUNTRY']}`;
          const odmRocarrier = compareData['ODM ROCARRIER'];

          description += `| ${carrierCountry} | ${odmRocarrier} |\\`;
        }
      }
    } else {
      description += '||ro.carrier||Target Product||Memory Config||\\';
      for (const compareData of rowsWithData) {
        if (
          compareToCheck({
            compareData,
            rocarrier,
            target,
            elabel,
            subsidy,
            model,
          })
        ) {
          const targetProduct = compareData['BUILD NAME'];
          const memoryConfig = compareData['MEMORY'];

          description += `| ${rocarrier} | ${targetProduct} | ${memoryConfig} |\\`;
        }
      }
    }

    rowData['DESCRIPTION'] = description;
  }

  return rowsWithData;
}

function setCheck(rowsWithData) {
  for (const [index1, row1] of rowsWithData.entries()) {
    const target = row1['SOFTWARE TA'];
    const elabel = row1['E-LABEL FILE'];
    const rocarrier = row1['RO.CARRIER'];
    const subsidy = row1['SUBSIDY LOCK'];
    const model = row1['MODEL'];

    if (!row1['CHECK']) {
      row1['CHECK'] = '1';
    }

    for (let index2 = index1 + 1; index2 < rowsWithData.length; index2++) {
      const row2 = rowsWithData[index2];

      if (
        compareToCheck({
          compareData: row2,
          rocarrier,
          target,
          elabel,
          subsidy,
          model,
        })
      ) {
        row2['CHECK'] = '0';
      }
    }
  }

  return rowsWithData;
}
module.exports = {
  getRowsData,
  setDescriptionAndSwVersion,
  setCheck,
  createSvnkit,
  compareToCheck,
  updateSvnkitFieldInWB,
};
