function getPositionsForSvnkit(submissionControlSheet) {
  const MAX_ROW_TO_CHECK = 4;
  const submissionTitlePositions = {
    CARRIER: -1,
    COUNTRY: -1,
    'RO.CARRIER': -1,
    MODEL: -1,
    'SS / DS': -1,
    'SOFTWARE TA': -1,
    'SUBSIDY LOCK': -1,
    'LABEL FILE': -1,
    SIGNED: -1,
    MEMORY: -1,
    FINGERPRINT: -1,
    BOOTLOADER: -1,
    'TARGET PRODUCT': -1,
  };

  const titlesToCheck = Object.keys(submissionTitlePositions);

  const odmCarriersTitle = [
    'ro.carrier.ontim',
    'Tinno ro.carrier',
    'CarrierID from Tinno\n(Used in CarrerID tool)',
    'ODM ro.carrier',
  ];

  const rows = submissionControlSheet.data.values;

  for (let index = 0; index <= MAX_ROW_TO_CHECK; index++) {
    const row = rows[index];

    for (const cell of row) {
      for (const title in submissionTitlePositions) {
        if (
          cell.toUpperCase().includes(title) &&
          submissionTitlePositions[title] === -1
        ) {
          submissionTitlePositions[title] = row.indexOf(cell);
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

module.exports = { getPositionsForSvnkit };
