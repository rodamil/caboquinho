const axios = require('axios');

async function makeLogin(username, password, url) {
  const { data } = await axios.post(`${url}/rest/auth/1/session`, {
    username,
    password,
  });

  return data;
}

module.exports = { makeLogin };
