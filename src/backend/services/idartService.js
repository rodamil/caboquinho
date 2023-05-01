const { idartModel } = require('../models');

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

module.exports = { getNpiProjectNames, getRegionNames, getLaunchType };
