import axios from 'axios';
import IIssueCreated from '../../interfaces/issueCreatedInterface';

const PROJECT_NAMES_URL =
  'https://idart.mot.com/rest/motojirarest/1.0/dbRestAPI/GetNPIprojectNames';

const REGION_NAMES_URL =
  'https://idart.mot.com/rest/motojirarest/1.0/dbRestAPI/GetNPIRegions';

const LAUNCH_TYPE_URL =
  'https://idart.mot.com/rest/motojirarest/1.0/dbRestAPI/GetNPILaunchType';

type JiraNpiProjectNames = {
  NPIProjectName: [string];
};

type JiraNpiRegionNames = {
  NPI_Region: [string];
};

type JiraNpiLaunchTypes = {
  NPI_Launch_Type: [string];
};

async function getNpiProjectNames(authorization: string): Promise<JiraNpiProjectNames[]> {
  const { data } = await axios.get<JiraNpiProjectNames[]>(PROJECT_NAMES_URL, {
    headers: { Authorization: authorization },
  });

  return data;
}

async function getRegionNames(authorization: string): Promise<JiraNpiRegionNames[]> {
  const { data } = await axios.get<JiraNpiRegionNames[]>(REGION_NAMES_URL, {
    headers: { Authorization: authorization },
  });

  return data;
}

async function getLaunchType(authorization: string): Promise<JiraNpiLaunchTypes[]> {
  const { data } = await axios.get<JiraNpiLaunchTypes[]>(LAUNCH_TYPE_URL, {
    headers: { Authorization: authorization },
  });

  return data;
}

async function createIssue(
  authorization: string,
  requestBody: any,
  url: string,
): Promise<IIssueCreated> {
  const { data } = await axios.post<IIssueCreated>(
    `${url}/rest/api/2/issue`,
    requestBody,
    {
      headers: { Authorization: `${authorization}` },
    },
  );

  return data;
}

export default { getRegionNames, getLaunchType, getNpiProjectNames, createIssue };
