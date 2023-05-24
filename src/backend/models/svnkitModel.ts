const axios = require('axios');

const DESIGN_RESPONSIBILITY_URL =
  'https://idart.mot.com/rest/mot-api/jsvnkit/1.0/api/get-design-responsibility-list?NPIProjectName=';

async function getDesignResponsibilityList(authorization, projectName) {
  const { data } = await axios.get(`${DESIGN_RESPONSIBILITY_URL}${projectName}`, {
    headers: { Authorization: authorization },
  });

  return data;
}

module.exports = { getDesignResponsibilityList };
