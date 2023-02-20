const { svnkitModel } = require('../models');

const SVNKIT_PROJECT_ID = '19280';
const SVNKIT_ISSUE_TYPE_ID = '108';

const handleDesignResponsibility = ({ list, projectName, model, ssDS }) => {
  const findDesignResponsibility = list[projectName].find((option) => {
    const upOption = option.toUpperCase();

    return (
      upOption.includes(projectName.toUpperCase()) &&
      upOption.includes(ssDS.toUpperCase()) &&
      upOption.includes(model.toUpperCase())
    );
  });

  if (findDesignResponsibility) {
    return findDesignResponsibility;
  } else {
    return `${projectName} ${ssDS} ${model}`;
  }
};

async function create(svnkitData, authorization, url) {
  try {
    const ssDS = svnkitData['SS / DS'];
    const isDualSim = ssDS === 'DS';
    const hasESIM = svnkitData['ESIM'] === 'TRUE';

    const desginResponsibilityOptions = {};
    let dualSimField = '47545'; // false
    let simCardSlotsField = 'psim';
    let updateInfo = {
      customfield_16113: [{ set: svnkitData['RO.CARRIER'] }], // Channel Model Name
    };

    // Dual SIM
    if (isDualSim) {
      dualSimField = '47544'; //true

      if (hasESIM) {
        simCardSlotsField = 'psim + esim';
      } else {
        simCardSlotsField = 'psim + psim';
      }
    }

    // Channel Model Name or Carrier Utag
    if (svnkitData['CHANNEL ID'] === '0x00') {
      updateInfo['customfield_22610'] = [{ set: svnkitData['RO.CARRIER'] }]; // Carrier UTAG
      delete updateInfo['customfield_16113']; // Channel Model Name
    }

    // Design Responsibility
    const projectName = svnkitData['PROJECT NAME'];
    const model = svnkitData['MODEL'];

    if (!desginResponsibilityOptions[projectName]) {
      try {
        const designsResponse = await svnkitModel.getDesignResponsibilityList(
          authorization,
          projectName,
        );
        desginResponsibilityOptions[projectName] = designsResponse;
      } catch (err) {
        desginResponsibilityOptions[projectName] = [];
      }
    }

    const designResponsibility = handleDesignResponsibility({
      list: desginResponsibilityOptions,
      projectName,
      model,
      ssDS,
    });

    const requestBody = {
      update: updateInfo,
      fields: {
        project: { id: SVNKIT_PROJECT_ID },
        issuetype: { id: SVNKIT_ISSUE_TYPE_ID },
        summary: `${svnkitData['CARRIER COUNTRY']}: New SVN Kit request for ${model} ${projectName}`,
        description: svnkitData['DESCRIPTION'].split('\\').join('\n'),
        customfield_14810: projectName,
        customfield_14811: model,
        customfield_10407: { value: svnkitData['CARRIER COUNTRY'] },
        customfield_14813: designResponsibility,
        customfield_16112: svnkitData['CHANNEL ID'],
        customfield_14825: svnkitData['SOFTWARE TA'],
        customfield_22021: svnkitData['SOFTWARE TA'],
        customfield_24713: { id: dualSimField },
        customfield_25528: { value: simCardSlotsField },
        customfield_14827: svnkitData['FINGERPRINT'],
        customfield_14828: svnkitData['BOOTLOADER'],
        customfield_14831: { name: svnkitData['TAM'] },
        customfield_14821: [{ name: svnkitData['PRODUCT MANAGER'] }],
        customfield_14832: { value: 'No' },
        customfield_14833: { value: 'CFC' },
        customfield_13316: `No||CFC||${svnkitData['SIGNED']}|| ||SOFTWARE ${model} ${svnkitData['CARRIER COUNTRY']} ${svnkitData['SOFTWARE TA']} CFC|| || || || ||\nNo||MBN||a|| ||a|| || || || ||\nNo||RAMLoader||aa|| ||aa|| || || || ||`,
        customfield_24714: { value: svnkitData['LANGUAGE'] },
      },
    };

    const kitResponse = await svnkitModel.create(
      authorization,
      requestBody,
      url,
    );

    return kitResponse;
  } catch (err) {
    if (err.response.status == 400) {
      throw new Error('invalidKitEntry');
    } else {
      throw new Error('internalError');
    }
  }
}

async function getNpiProjectNames(authorization) {
  const response = await svnkitModel.getNpiProjectNames(authorization);

  return response.map((project) => project.NPIProjectName[0]);
}

module.exports = { create, getNpiProjectNames };
