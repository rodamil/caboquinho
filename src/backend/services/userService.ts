const { userModel } = require('../models');

async function makeLogin(username, password, url) {
  try {
    const res = await userModel.makeLogin(username, password, url);

    if (res.session.name) {
      const token = `Basic ${Buffer.from(`${username}:${password}`).toString(
        'base64',
      )}`;

      return token;
    }
  } catch (err) {
    if (err.response.status == 401) {
      throw new Error('invalidCredentials');
    } else if (err.response.status == 403) {
      throw new Error('forbiddenCredentials');
    } else {
      throw new Error('internalError');
    }
  }
}

module.exports = { makeLogin };
