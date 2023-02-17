const axios = require('axios');
const serverUrl = process.env.BASE_SERVER_URL || 'http://localhost:';
const serverPort = process.env.PORT || 3001;

window.onload = () => {
  localStorage.clear();

  document.querySelector('#btn-login').addEventListener('click', async (e) => {
    e.target.disabled = true;

    const userCoreid = document.querySelector('#user-coreid').value;
    const userPassword = document.querySelector('#user-password').value;

    try {
      const { data } = await axios.post(`${serverUrl}${serverPort}/login`, {
        username: userCoreid,
        password: userPassword,
      });

      localStorage.setItem('jiraToken', data.token);
      window.location = 'svnkitForm.html';
    } catch (e) {
      const errorContainer = document.querySelector('#login-error-container');
      errorContainer.innerHTML = e.response.data.message;
      console.log(e);
    }
    e.target.disabled = false;
  });
};
