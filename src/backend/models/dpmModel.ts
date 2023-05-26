import axios from 'axios';

async function getXml(authorization, xmlUrl) {
  const { data } = await axios.get(xmlUrl, {
    headers: { Authorization: `${authorization}` },
  });

  return data;
}

export default { getXml };
