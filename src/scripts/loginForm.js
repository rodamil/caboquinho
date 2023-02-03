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
      const res = await axios.post(`${serverUrl}${serverPort}/login`, {
        username: userCoreid,
        password: userPassword,
      });

      if (res.status == 200) {
        localStorage.setItem(
          'jiraToken',
          Buffer.from(`${userCoreid}:${userPassword}`).toString('base64'),
        );
        window.location = 'svnkitForm.html';
      }
    } catch (e) {
      if (e.response) {
        const status = e.response.data.status;
        const errorContainer = document.querySelector('#login-error-container');

        if (status === 401) {
          errorContainer.innerHTML = 'Your coreid or password is invalid.';
        } else if (status === 403) {
          errorContainer.innerHTML =
            'Your login has failed more than two times, you need to make login in Jira Website and pass manually of the security CAPTCHA.';
        }
      } else {
        console.log(e.message);
      }
    }
    e.target.disabled = false;
  });
};
