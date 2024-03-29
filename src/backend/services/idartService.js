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
  const { subtasksList, parentKey } = subtaskData;

  try {
    for (const summary of subtasksList) {
      const requestBody = {
        fields: {
          project: { key: CONTROL_CR_PROJECT_KEY },
          issuetype: { name: 'Sub-task' },
          summary,
          parent: { key: parentKey },
          labels: ['IA_NPI_eldorado', 'IA_NPI_MAO', 'ia_validation'],
        },
      };

      await idartModel.createIssue(authorization, requestBody, url);
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
    projectName,
    region,
    launchType,
    build,
    subtasksList,
  } = controlCrData;

  const summary = `[${projectName}][NPI][${region}][${launchType}] - Build ${build} `;

  const description = `Let's run the ${projectName} - ${launchType}\n\nCampaign Drive: [Link|${evidenceFolder}]\n\nWorkbook: [Link|${wbLink}]\n\nSpreadsheet validation: [Link|${validationLink}]\n\nValidation date: ${duedate}\n\nTL: ${technicalLead}\n\nPM: ${productManager}`;

  try {
    const requestBody = {
      fields: {
        project: { key: CONTROL_CR_PROJECT_KEY },
        issuetype: { name: 'Task' },
        summary,
        description,
        duedate,
        labels: ['IA_NPI_eldorado', 'IA_NPI_MAO'],
        assignee: { name: reporter },
      },
    };

    const controlCrCreated = await idartModel.createIssue(
      authorization,
      requestBody,
      url
    );

    createSubTasks(
      authorization,
      {
        subtasksList,
        parentKey: controlCrCreated.key,
      },
      url
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
