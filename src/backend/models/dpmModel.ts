import axios from 'axios';

async function getXml(authorization: string, xmlUrl: string): Promise<string> {
  const { data } = await axios.get<string>(xmlUrl, {
    headers: { Authorization: `${authorization}` },
  });

  return data;
}

export default { getXml };
