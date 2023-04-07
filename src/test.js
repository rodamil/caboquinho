const { getProjectNames } = require('./scripts/getSvnkitLists');
const { getPositionsInSubmission } = require('./scripts/handleDataInSubmission');
const { getSheet } = require('./scripts/handleSheet');

// HawaiiP - SMR2302
const wbLink =
  'https://docs.google.com/spreadsheets/d/1gaQT5KAaFfHxJLrQwJ-rGI1QiT02MopnNMfTVwGV49w/edit#gid=1301952764';

const DPM_DAY_RULES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=300192935';

const DPM_UPDATE_RULES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1553398430';

const DPM_MULTCONFIG_RULES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1664036455';

const isMulticonfig = true;
const isOdm = false;
const inputRows = '22-28';
const pm = 'endoliv';
const tl = 'victormf';
const reporter = 'rodlima';

async function main() {
  // Get sheets data
  const [worksheet, dpmDayRules, dpmUpdateRules, dpmMultConfigRules] = await Promise.all([
    getSheet(wbLink),
    getSheet(DPM_DAY_RULES_URL),
    getSheet(DPM_UPDATE_RULES_URL),
    getSheet(DPM_MULTCONFIG_RULES_URL),
  ]);

  const titlePositions = getPositionsInSubmission(worksheet, 'dpm');

  const wbRows = worksheet.data.values;

  const rowsToHandle = [];

  // Filter only the wanted rows in WB and format it
  if (inputRows) {
    const splitedRange = inputRows.split(';');

    for (const range of splitedRange) {
      let [startRange, endRange] = range.split('-');

      if (!endRange) {
        endRange = startRange;
      }

      for (let index = startRange - 1; index <= endRange - 1; index++) {
        rowsToHandle.push(wbRows[index]);
      }
    }
  } else {
    rowsToHandle.push(...wbRows);
  }

  // Get lists for format the table data
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

  const updateRulesFormated = {};

  dpmUpdateRules.data.values.forEach((row, index) => {
    if (index > 0) {
      const currRocarrier = row[3];
      const currLanguage = row[4];

      updateRulesFormated[currRocarrier] = {
        language: currLanguage,
        SMR: {
          forcedUpgrade: row[6],
          downdloadWifiOnly: row[7],
          showPreDownloadMsg: row[8],
          showDownloadOptions: row[9],
        },
        MR: {
          forcedUpgrade: row[10],
          downdloadWifiOnly: row[11],
          showPreDownloadMsg: row[12],
          showDownloadOptions: row[13],
        },
      };
    }
  });

  const multiConfigRulesFormated = {};

  if (isMulticonfig) {
    dpmMultConfigRules.data.values.forEach((row, index) => {
      // console.log(row[0]);
      if (index > 0) {
        multiConfigRulesFormated[row[0]] = {
          color: row[1],
          groupCarriers: row[3],
        };
      }
    });
  }

  // console.log(multiConfigRulesFormated);
  // Map data to create the table
  const rowsToHandleFiltred = [];

  console.log(dayRulesFormated);

  rowsToHandle.forEach((rowData) => {
    if (!rowData['CHECKED']) {
      rowData['CHECKED'] = '1';

      const buildName1 = (rowData[titlePositions['BUILD NAME']] || '')
        .toUpperCase()
        .trim();
      const model1 = (rowData[titlePositions['MODEL']] || '').trim();
      const carrier1 = (rowData[titlePositions['CARRIER']] || '').trim();
      const country1 = (rowData[titlePositions['COUNTRY']] || '').trim();
      const ssDS1 = (rowData[titlePositions['SS / DS']] || '').trim();
      const source1 = (rowData[titlePositions['OTA SOURCE SW VERSION']] || '').trim();
      const target1 = (rowData[titlePositions['SOFTWARE TA']] || '').trim();
      const rocarrier1 = (rowData[titlePositions['RO.CARRIER']] || '').trim();
      const launchType1 = (rowData[titlePositions['LAUNCH TYPE']] || '').trim();
      const deviceId1 = (rowData[titlePositions['DEVICE ID']] || '').trim();
      let forcedUpgrade = '';
      let downdloadWifiOnly = '';
      let showPreDownloadMsg = '';
      let showDownloadOptions = '';
      let formatedLaunchType = '';
      let summary = '';
      let rocarrierField = '';
      const deivceIdField = [deviceId1];
      const launchCountriesField = [country1];
      const carriersCountriesField = [`${carrier1} - ${country1}`];
      const rocarrierPlannedFIeld = [rocarrier1];
      const countriesThatUpdateInSameDay = [country1];
      let daysToUpdateInSmr = '';

      const [launchTypeNum] = launchType1.match(/\d+/g);
      const [launchTypeText] = launchType1.match(/[a-zA-Z]+/g);

      const updateRules = updateRulesFormated[rocarrier1][launchTypeText.toUpperCase()];

      if (updateRules) {
        forcedUpgrade = updateRules['forcedUpgrade'];
        downdloadWifiOnly = updateRules['downdloadWifiOnly'];
        showPreDownloadMsg = updateRules['showPreDownloadMsg'];
        showDownloadOptions = updateRules['showDownloadOptions'];
      }

      if (launchTypeText.toUpperCase() == 'MR') {
        formatedLaunchType = `${launchTypeText} ${launchTypeNum}`;
      } else {
        formatedLaunchType = launchType1;

        for (const dayRule in dayRulesFormated) {
          const countriesInThisDay = dayRulesFormated[dayRule].map((e) =>
            e.toUpperCase(),
          );

          if (countriesInThisDay.includes(country1.toUpperCase())) {
            daysToUpdateInSmr = `${dayRule} days`;
            countriesThatUpdateInSameDay.push(
              ...dayRulesFormated[dayRule].filter((e) => e !== country1),
            );
            break;
          }
        }
      }

      let filtredGroupCarriers = ['', ['']];

      if (isMulticonfig) {
        rocarrierField = 'N/A (Not Applicable)';

        for (const group in multiConfigRulesFormated) {
          const groupCarriers =
            multiConfigRulesFormated[group]['groupCarriers'].split(',');

          if (groupCarriers.includes(rocarrier1)) {
            filtredGroupCarriers = [group, groupCarriers];
            break;
          }
        }
      } else {
        rocarrierField = rocarrier1;
      }

      const [groupTitle, groupCarriers] = filtredGroupCarriers;

      if (groupTitle) {
        summary = `${buildName1} - ${model1} - ${groupTitle} ${daysToUpdateInSmr}- ${ssDS1} - ${source1} - ${target1}`;
      } else {
        summary = `${buildName1} - ${model1} - ${carrier1} ${country1} ${daysToUpdateInSmr} - ${ssDS1} - ${source1} - ${target1}`;
      }

      rowsToHandle.forEach((compareRow) => {
        const model2 = (compareRow[titlePositions['MODEL']] || '').trim();
        const carrier2 = (compareRow[titlePositions['CARRIER']] || '').trim();
        const country2 = (compareRow[titlePositions['COUNTRY']] || '').trim();
        const ssDS2 = (compareRow[titlePositions['SS / DS']] || '').trim();
        const source2 = (
          compareRow[titlePositions['OTA SOURCE SW VERSION']] || ''
        ).trim();
        const target2 = (compareRow[titlePositions['SOFTWARE TA']] || '').trim();
        const rocarrier2 = (compareRow[titlePositions['RO.CARRIER']] || '').trim();
        const launchType2 = (compareRow[titlePositions['LAUNCH TYPE']] || '').trim();
        const deviceId2 = (compareRow[titlePositions['DEVICE ID']] || '').trim();

        if (
          model1 === model2 &&
          ssDS1 === ssDS2 &&
          source1 === source2 &&
          target1 === target2 &&
          launchType1 === launchType2 &&
          !compareRow['CHECKED']
        ) {
          const checkGroupDaysSMR =
            launchTypeText.toUpperCase() === 'SMR' &&
            countriesThatUpdateInSameDay.includes(country2);

          const checkMultiConfig =
            !checkGroupDaysSMR && isMulticonfig && groupCarriers.includes(rocarrier2);

          const agroupTheSameRocarrier =
            !checkGroupDaysSMR && !checkMultiConfig && rocarrier1 === rocarrier2;

          if (checkGroupDaysSMR || checkMultiConfig || agroupTheSameRocarrier) {
            compareRow['CHECKED'] = '0';
            deivceIdField.indexOf(deviceId2) === -1 && deivceIdField.push(deviceId2);
            launchCountriesField.indexOf(country2) === -1 &&
              launchCountriesField.push(country2);
            carriersCountriesField.indexOf(`${carrier2} - ${country2}`) === -1 &&
              carriersCountriesField.push(`${carrier2} - ${country2}`);
            rocarrierPlannedFIeld.indexOf(rocarrier2) === -1 &&
              rocarrierPlannedFIeld.push(rocarrier2);
          }
        }
      });

      rowsToHandleFiltred.push({
        summary,
        rocarrierField,
        cds: '',
        xml: '',
        productName: '',
        model: model1,
        source: source1,
        target: target1,
        deivceIdField,
        launchCountriesField,
        carriersCountriesField,
        launchType: formatedLaunchType,
        packLocation: '',
        cmValidation: '',
        forcedUpgrade,
        downdloadWifiOnly,
        showPreDownloadMsg,
        showDownloadOptions,
        linkToBotaText: '',
        crn: 'https://N/A',
        md5: '',
        packageSize: '',
        listOfDevices: '',
        pm,
        wbLink,
        reporter,
        tl,
        rocarrierPlannedFIeld,
        isMulticonfig,
        isOdm,
        check: rowData['CHECKED'],
      });
    }
  });

  console.log(rowsToHandleFiltred);
}

main();
