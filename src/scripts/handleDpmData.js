function getRowsDataForDpm({
  wbRows,
  titlePositions,
  productManager,
  thecnicalLead,
  isOdm,
  multiConfigLink,
  dpmDayRules,
  dpmUpdateRules,
  multiConfigRules,
}) {
  const isMultiConfig = multiConfigLink !== '';
  const rowsToHandleFiltred = [];

  wbRows.forEach((rowData) => {
    try {
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
        let summary = '';
        let rocarrierField = '';
        const deivceIdField = [deviceId1];
        const launchCountriesField = [country1];
        const carriersCountriesField = [`${carrier1} - ${country1}`];
        const rocarrierPlannedFIeld = [rocarrier1];
        const countriesThatUpdateInSameDay = [country1];
        let daysToUpdateInSmr = '';
        const launchTypeText = launchType1.toUpperCase().includes('SMR') ? 'SMR' : 'MR';
        let updateRules;

        if (dpmUpdateRules[rocarrier1]) {
          updateRules = dpmUpdateRules[rocarrier1][launchTypeText];
        }

        if (updateRules) {
          forcedUpgrade = updateRules['forcedUpgrade'];
          downdloadWifiOnly = updateRules['downdloadWifiOnly'];
          showPreDownloadMsg = updateRules['showPreDownloadMsg'];
          showDownloadOptions = updateRules['showDownloadOptions'];
        }

        if (launchTypeText === 'SMR') {
          for (const dayRule in dpmDayRules) {
            const countriesInThisDay = dpmDayRules[dayRule].map((e) => e.toUpperCase());

            if (countriesInThisDay.includes(country1.toUpperCase())) {
              daysToUpdateInSmr = `${dayRule} days`;
              countriesThatUpdateInSameDay.push(
                ...dpmDayRules[dayRule].filter((e) => e !== country1),
              );
              break;
            }
          }
        }

        let filtredGroupCarriers = ['', ['']];

        if (isMultiConfig) {
          rocarrierField = 'N/A (Not Applicable)';

          for (const group in multiConfigRules) {
            const groupCarriers = multiConfigRules[group]['groupCarriers'].split(',');

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

        wbRows.forEach((compareRow) => {
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
              !checkGroupDaysSMR && isMultiConfig && groupCarriers.includes(rocarrier2);

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

        if (rocarrierPlannedFIeld.length === 1) {
          rocarrierField = rocarrier1;
        }

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
          launchType: launchType1,
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
          pm: productManager,
          wbLink,
          tl: thecnicalLead,
          rocarrierPlannedFIeld,
          isMultiConfig,
          isOdm,
          check: rowData['CHECKED'],
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  return rowsToHandleFiltred;
}

module.exports = { getRowsDataForDpm };
