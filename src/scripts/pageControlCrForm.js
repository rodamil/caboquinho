const { getRegionNames, getLaunchTypes } = require('../scripts/getLists');
const { createControlCr } = require('../scripts/handleControlCrData');
const https = require('https');

let BASE_IDART_URL = '';

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-test.mot.com/browse';
} else {
  BASE_IDART_URL = 'https://idart.mot.com/browse';
}

const subtasksMotorola = [
  { name: 'PS&C', checked: false },
  { name: 'Request devices in Davros', checked: false },
  { name: 'Create CR Jaguar', checked: true },
  { name: 'Create CFC CR', checked: true },
  { name: 'Request OTA Packages', checked: true },
  { name: 'Asset Non Secure', checked: true },
  { name: 'CM Validation', checked: true },
  { name: 'Create CPV Intput', checked: true },
  { name: 'CPV Validation', checked: true },
  { name: 'Subsidy Lock', checked: true },
  { name: 'DFS', checked: true },
  { name: 'SVNKit Creation', checked: true },
  { name: 'SVNKit Validation', checked: true },
  { name: 'DPM Creation', checked: true },
  { name: 'Presoak Non Secure', checked: true },
  { name: 'Presoak Secure', checked: true },
  { name: 'Asset Secure', checked: true },
];

const subtasksOdm = [
  { name: 'Create CR Jaguar', checked: true },
  { name: 'SVNKit Creation', checked: true },
  { name: 'SVNKit Validation', checked: true },
  { name: 'DPM Creation', checked: true },
  { name: 'Pre-soak evaluation', checked: true },
];

document.querySelector('#btn-go-back').addEventListener('click', () => {
  const response = window.confirm(
    'You will lose your changes, do you really want to go back?'
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
    const subtasksContainer = document.querySelector('#subtasks-container');
    const isOdm = JSON.parse(localStorage.getItem('isOdm'));

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

    const createSubtasksView = (subtaskList) => {
      subtaskList.forEach(({ name, checked }) => {
        const div = document.createElement('div');
        div.innerHTML = `
        <label class="sub-task-option">
          <input
            type="checkbox"
            class="filled-in"
            ${checked ? 'checked' : ''}
          />
          <span>${name}</span>
        </label>
        `;

        subtasksContainer.appendChild(div);
      });
    };

    if (isOdm) {
      createSubtasksView(subtasksOdm);
    } else {
      createSubtasksView(subtasksMotorola);
    }
  } catch (error) {
    console.log(error);
  }

  const controlCrForm = document.querySelector('#control-cr-form');
  controlCrForm.classList.remove('hide');
};

document
  .querySelector('#control-cr-form')
  .addEventListener('submit', async (e) => {
    const createCotrolCrBtn = document.querySelector('#create-control-cr-btn');
    createCotrolCrBtn.disabled = true;

    e.preventDefault();

    try {
      const subtasksOptions = [
        ...document.querySelectorAll('.sub-task-option'),
      ];

      const subtasksChecked = subtasksOptions
        .map((option) => {
          const input = option.querySelector('input');
          const span = option.querySelector('span');

          if (input.checked) {
            return span.innerText;
          }
        })
        .filter((option) => option);

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
        subtasksList: subtasksChecked,
      };

      const controlCrCreated = await createControlCr(
        requestBody,
        localStorage.getItem('token')
      );

      if (controlCrCreated.key) {
        const createdCrContainer = document.querySelector(
          '#control-cr-created-id'
        );
        const createdCr = `${BASE_IDART_URL}/${controlCrCreated.key}`;
        createdCrContainer.innerText = createdCr;

        document
          .querySelector('#await-subtasks-creation')
          .classList.remove('hide');

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
