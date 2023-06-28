import axios from 'axios';

const DESIGN_RESPONSIBILITY_URL =
  'https://idart.mot.com/rest/mot-api/jsvnkit/1.0/api/get-design-responsibility-list?NPIProjectName=';

async function getDesignResponsibilityList(
  authorization: string,
  projectName: string,
): Promise<string[]> {
  const { data } = await axios.get<string[]>(
    `${DESIGN_RESPONSIBILITY_URL}${projectName}`,
    {
      headers: { Authorization: authorization },
    },
  );

  return data;
}

export default { getDesignResponsibilityList };
