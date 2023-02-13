const axios = require('axios');
const serverUrl = process.env.BASE_SERVER_URL || 'http://localhost:';
const serverPort = process.env.PORT || 3001;

async function createSvnkit(rowData, token) {
  try {
    const { data } = await axios.post(
      `${serverUrl}${serverPort}/create-svnkit`,
      { svnkitData: rowData },
      { headers: { Authorization: token } },
    );

    return data;
  } catch (e) {
    if (e.response) {
      console.table([
        ...Object.values(e.response.data.errors),
        e.response.data.message,
      ]);
    } else {
      console.log(e.message);
    }

    return '';
  }
}

function getRowsData({
  worksheet,
  titlePositions,
  tamNamesData,
  languagesData,
  channelIdsData,
  jsvnkitCarriersData,
  productManager,
}) {
  const rows = worksheet.data.values;
  const dataForTable = [];
  const valuesToIgnore = ['', 'END'];

  const formatString = (str) => {
    if (str) {
      return str.split('(')[0].trim();
    } else {
      return '';
    }
  };

  for (const row of rows) {
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
    const subsidyOffTypes = ['NO', ''];

    if (subsidyOffTypes.includes(subsidy.toUpperCase())) {
      subsidy = 'Off';
    }

    currentContent['PRODUCT MANAGER'] = productManager;
    currentContent['ESIM'] = '';
    currentContent['PROJECT NAME'] = '';

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

    let countTitles = 0;
    for (const title in titlePositions) {
      const currentCell = formatString(row[titlePositions[title]]);

      if (
        title !== currentCell.toUpperCase() &&
        !valuesToIgnore.includes(currentCell.toUpperCase())
      ) {
        if (title === 'RO.CARRIER') {
          currentContent[title] = rocarrier;
        } else if (title === 'SUBSIDY LOCK') {
          currentContent[title] = subsidy;
        } else {
          currentContent[title] = currentCell;
        }

        countTitles += 1;
      }
    }

    if (countTitles === Object.keys(titlePositions).length) {
      dataForTable.push(currentContent);
    }
  }

  return dataForTable;
}

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
    const elabel = rowData['LABEL FILE'];
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
      description += `||Carrier (Customer + Country)||ro.carrier.${company.toLowerCase()}||\\`;

      for (const compareData of rowsWithData) {
        if (
          rocarrier == compareData['RO.CARRIER'] &&
          target == compareData['SOFTWARE TA'] &&
          elabel == compareData['LABEL FILE'] &&
          subsidy == compareData['SUBSIDY LOCK'] &&
          model == compareData['MODEL']
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
          rocarrier == compareData['RO.CARRIER'] &&
          target == compareData['SOFTWARE TA'] &&
          elabel == compareData['LABEL FILE'] &&
          subsidy == compareData['SUBSIDY LOCK'] &&
          model == compareData['MODEL']
        ) {
          const targetProduct = compareData['TARGET PRODUCT'];
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
    const elabel = row1['LABEL FILE'];
    const rocarrier = row1['RO.CARRIER'];
    const subsidy = row1['SUBSIDY LOCK'];
    const model = row1['MODEL'];

    if (!row1['CHECK']) {
      row1['CHECK'] = '1';
    }

    for (let index2 = index1 + 1; index2 < rowsWithData.length; index2++) {
      const row2 = rowsWithData[index2];

      if (
        target == row2['SOFTWARE TA'] &&
        elabel == row2['LABEL FILE'] &&
        rocarrier == row2['RO.CARRIER'] &&
        subsidy == row2['SUBSIDY LOCK'] &&
        model == row2['MODEL']
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
};
