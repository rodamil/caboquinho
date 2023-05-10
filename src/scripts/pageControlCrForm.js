const https = require('https');

let BASE_IDART_URL = '';

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-test.mot.com/browse';
} else {
  BASE_IDART_URL = 'https://idart.mot.com/browse';
}

const { getRegionNames, getLaunchTypes } = require('../scripts/getLists');
const { createControlCr } = require('../scripts/handleControlCrData');
document.querySelector('#btn-go-back').addEventListener('click', () => {
  const response = window.confirm(
    'You will lose your changes, do you really want to go back?',
  );

  if (response) {
    history.back();
  }
});

window.onload = async () => {
  try {
    const [regionNames, launchTypes] = await Promise.all([
      getRegionNames(),
      getLaunchTypes(),
    ]);

    const regionNamesSelect = document.querySelector('#regions-select');
    const launchTypeSelec = document.querySelector('#launch-types-select');

    regionNames.forEach((regionName) => {
      const option = document.createElement('option');
      option.innerText = regionName;
      option.value = regionName;

      regionNamesSelect.appendChild(option);
    });

    launchTypes.forEach((launchType) => {
      const option = document.createElement('option');
      option.innerText = launchType;
      option.value = launchType;

      launchTypeSelec.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }

  const controlCrForm = document.querySelector('#control-cr-form');
  controlCrForm.classList.remove('hide');
};

document.querySelector('#control-cr-form').addEventListener('submit', async (e) => {
  const createCotrolCrBtn = document.querySelector('#create-control-cr-btn');
  createCotrolCrBtn.disabled = true;

  e.preventDefault();

  const requestBody = {
    duedate: document.querySelector('#due-date').value,
    reporter: localStorage.getItem('testLead'),
    evidenceFolder: document.querySelector('#evidence-folder-link').value,
    wbLink: localStorage.getItem('wbLink'),
    validationLink: document.querySelector('#validation-link').value,
    technicalLead: localStorage.getItem('thecnicalLead'),
    productManager: localStorage.getItem('productManager'),
    region: document.querySelector('#regions-select').value,
    build: document.querySelector('#buid-target').value,
    launchType: document.querySelector('#launch-types-select').value,
    projectName: document.querySelector('#project-name').value,
    isOdm: JSON.parse(localStorage.getItem('isOdm')),
  };

  try {
    const controlCrCreated = await createControlCr(
      requestBody,
      localStorage.getItem('token'),
    );

    if (controlCrCreated.key) {
      const createdCrContainer = document.querySelector('#control-cr-created-id');

      const createdCr = `${BASE_IDART_URL}/${controlCrCreated.key}`;
      createdCrContainer.innerText = createdCr;

      createdCrContainer.addEventListener('click', async () => {
        await navigator.clipboard.writeText(createdCr);
        document.querySelector('#copied-message').classList.remove('hide');
      });
    }
  } catch (error) {
    console.log(error);
  }

  createCotrolCrBtn.disabled = false;
});
