const { formatString } = require('./utils');

function getPositionsInSubmission(submissionControlSheet, projectType) {
  const MAX_ROW_TO_CHECK = 4;
  const odmCarriersTitle = [
    'ro.carrier.ontim',
    'Tinno ro.carrier',
    'CarrierID from Tinno\n(Used in CarrerID tool)',
    'ODM ro.carrier',
    'ro.carrier.longcheer',
  ];

  let submissionTitlePositions = {};

  if (projectType === 'svnkit') {
    submissionTitlePositions = {
      'BUILD NAME': -1,
      CARRIER: -1,
      COUNTRY: -1,
      'RO.CARRIER': -1,
      MODEL: -1,
      MEMORY: -1,
      'SS / DS': -1,
      'SOFTWARE TA': -1,
      SVNKIT: -1,
      FINGERPRINT: -1,
      BOOTLOADER: -1,
      SIGNED: -1,
      'SUBSIDY LOCK': -1,
      'E-LABEL FILE': -1,
    };
  } else if (projectType === 'dpm') {
    submissionTitlePositions = {
      'BUILD NAME': -1,
      CARRIER: -1,
      COUNTRY: -1,
      'RO.CARRIER': -1,
      MODEL: -1,
      'SS / DS': -1,
      'LAUNCH TYPE': -1,
      'DEVICE ID': -1,
      'SOFTWARE TA': -1,
      'OTA SOURCE SW VERSION': -1,
      'DPM CR': -1,
    };
  }

  const titlesToCheck = Object.keys(submissionTitlePositions);

  const rows = submissionControlSheet.data.values;

  for (let index = 0; index <= MAX_ROW_TO_CHECK; index++) {
    const row = rows[index];

    for (const cell of row) {
      for (const title in submissionTitlePositions) {
        if (cell.toUpperCase() === title) {
          submissionTitlePositions[title] = row.indexOf(cell);
        }

        if (projectType === 'svnkit') {
          if (cell.toUpperCase().includes('MEMORY')) {
            submissionTitlePositions['MEMORY'] = row.indexOf(cell);
          }
        }
      }

      for (const odmTitle of odmCarriersTitle) {
        if (cell.toUpperCase().includes(odmTitle.toUpperCase())) {
          submissionTitlePositions['ODM ROCARRIER'] = row.indexOf(cell);
        }
      }
    }
  }

  let columnsNotFound = '';

  for (const titlePosition in submissionTitlePositions) {
    if (
      submissionTitlePositions[titlePosition] === -1 &&
      titlesToCheck.includes(titlePosition)
    ) {
      columnsNotFound += `${titlePosition}, `;
    }
  }

  if (columnsNotFound.length > 0) {
    throw new Error(`These columns were not found: ${columnsNotFound}`);
  }

  return submissionTitlePositions;
}

function getRowsWithData({ worksheet, titlePositions, submissionRange }) {
  const valuesToIgnore = ['', 'END'];
  const columnsThatCanBeEmpty = ['SVNKIT', 'ODM ROCARRIER', 'DPM CR'];
  const columnsThatCanAppearInContent = ['SIGNED'];
  const wbRows = worksheet.data.values;
  const rowsForTable = [];
  const rowsToHandle = [];

  if (submissionRange) {
    const splitedRange = submissionRange.split(';');

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

  for (const row of rowsToHandle) {
    let countTitles = 0;
    let coluumnsThatAreWithFailures = [];

    for (const title in titlePositions) {
      const currentCell = formatString(row[titlePositions[title]]).toUpperCase();

      if (
        title !== currentCell &&
        !currentCell.includes(title) &&
        !valuesToIgnore.includes(currentCell)
      ) {
        countTitles += 1;
      } else if (columnsThatCanBeEmpty.includes(title)) {
        countTitles += 1;
      } else if (columnsThatCanAppearInContent.includes(title)) {
        countTitles += 1;
      } else {
        coluumnsThatAreWithFailures.push(title);
      }
    }

    if (countTitles === Object.keys(titlePositions).length) {
      rowsForTable.push(row);
    } else {
      if (row.length > 0) {
        console.log('###########################################');
        console.log("The row below has something missing, check if it's a Data Row");
        console.log(`Columns with some error: ${coluumnsThatAreWithFailures.join(', ')}`);
        console.log(row);
      }
    }
  }

  console.log(
    `########## End pull data from ${rowsToHandle.length} lines of spreadsheet ##########`,
  );

  return rowsForTable;
}

module.exports = { getPositionsInSubmission, getRowsWithData };
