const { idartModel } = require('../models');
const CONTROL_CR_PROJECT_KEY = 'IKLATAMIF';

const https = require('https');
https.globalAgent.options.rejectUnauthorized = false;

async function getNpiProjectNames(authorization) {
  const response = await idartModel.getNpiProjectNames(authorization);

  return response.map((project) => project.NPIProjectName[0]);
}

async function getRegionNames(authorization) {
  const response = await idartModel.getRegionNames(authorization);

  return response.map((project) => project['NPI_Region'][0]);
}

async function getLaunchType(authorization) {
  const response = await idartModel.getLaunchType(authorization);

  return response.map((project) => project['NPI_Launch_Type'][0]);
}

async function createSubTasks(authorization, subtaskData, url) {
  const { isOdm, parentKey } = subtaskData;

  try {
    const subtasksMotorla = [
      'Create CR Jaguar',
      'Create CFC CR',
      'Request OTA Packages',
      'Asset Non Secure',
      'CM Validation',
      'CPV Validation',
      'Subsidy Lock',
      'DFS',
      'SVNKit Creation',
      'SVNKit Validation',
      'DPM Creation',
      'Presoak Non Secure',
      'Presoak Secure',
      'Asset Secure',
    ];

    const subtasksOdm = [
      'Create CR Jaguar',
      'SVNKit Creation',
      'SVNKit Validation',
      'DPM Creation',
      'Pre-soak evaluation',
    ];

    const handleApi = async (list) => {
      for (const summary of list) {
        const requestBody = {
          fields: {
            project: { key: CONTROL_CR_PROJECT_KEY },
            issuetype: { name: 'Sub-task' },
            summary,
            parent: { key: parentKey },
          },
        };
        console.log(requestBody);
        await idartModel.createIssue(authorization, requestBody, url);
      }
    };

    if (isOdm) {
      handleApi(subtasksOdm);
    } else {
      handleApi(subtasksMotorla);
    }
  } catch (err) {
    console.log(err);
    throw new Error('internalError');
  }
}

async function createControlCr(authorization, controlCrData, url) {
  const {
    duedate,
    reporter,
    evidenceFolder,
    wbLink,
    validationLink,
    technicalLead,
    productManager,
    productName,
    region,
    lauchType,
    build,
    isOdm,
  } = controlCrData;

  const summary = `[${productName}][NPI][${region}][${lauchType}] - Build ${build} `;

  const description = `Let's run the ${productName} - ${lauchType}\n\nCampaign Drive: [Link|${evidenceFolder}]\n\nWorkbook: [Link|${wbLink}]\n\nSpreadsheet validation: [Link|${validationLink}]\n\nValidation date: ${duedate}\n\nTL: ${technicalLead}\n\nPM: ${productManager}`;

  try {
    const requestBody = {
      fields: {
        project: { key: CONTROL_CR_PROJECT_KEY },
        issuetype: { name: 'Task' },
        summary,
        description,
        duedate,
        labels: ['IA_NPI_eldorado'],
        assignee: { name: reporter },
      },
    };

    const controlCrCreated = await idartModel.createIssue(
      authorization,
      requestBody,
      url,
    );

    await createSubTasks(
      authorization,
      {
        isOdm,
        parentKey: controlCrCreated.key,
      },
      url,
    );

    return controlCrCreated;
  } catch (err) {
    console.log(err);
    throw new Error('internalError');
  }
}

module.exports = {
  getNpiProjectNames,
  getRegionNames,
  getLaunchType,
  createControlCr,
};
