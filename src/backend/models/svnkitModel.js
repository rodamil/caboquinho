const axios = require('axios');

const PROJECT_NAMES_URL =
  'https://idart.mot.com/rest/motojirarest/1.0/dbRestAPI/GetNPIprojectNames';

const DESIGN_RESPONSIBILITY_URL =
  'https://idart.mot.com/rest/mot-api/jsvnkit/1.0/api/get-design-responsibility-list?NPIProjectName=';

async function create(authorization, requestBody, url) {
  const { data } = await axios.post(`${url}/rest/api/2/issue`, requestBody, {
    headers: { Authorization: `${authorization}` },
  });

  return data;
}

async function getNpiProjectNames(authorization) {
  const { data } = await axios.get(PROJECT_NAMES_URL, {
    headers: { Authorization: authorization },
  });

  return data;
}

async function getDesignResponsibilityList(authorization, projectName) {
  const { data } = await axios.get(
    `${DESIGN_RESPONSIBILITY_URL}${projectName}`,
    {
      headers: { Authorization: authorization },
    },
  );

  return data;
}

module.exports = { create, getNpiProjectNames, getDesignResponsibilityList };
