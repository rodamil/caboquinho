const DPM_MULTI_CONFIG_RULES_URL =
  'https://docs.google.com/spreadsheets/d/1scVsPtpoFtVrk8kbOTFzXb1qiFqAr-RG-F5W_YT1R7Q/edit#gid=1664036455';

let submitUrl = '';

window.onload = () => {
  const issueForm = document.querySelector('#issue-form-container');
  issueForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location = submitUrl;
  });
};

document.querySelector('#btn-go-back').addEventListener('click', () => {
  const response = window.confirm(
    'You will lose your changes, do you really want to go back?',
  );
  if (response) {
    history.back();
  }
});

document.querySelector('#enable-submission-range').addEventListener('click', (e) => {
  const inputSubmissionRange = document.querySelector('#submission-range');

  if (e.target.checked) {
    inputSubmissionRange.disabled = true;
    inputSubmissionRange.value = '';
  } else {
    inputSubmissionRange.disabled = false;
  }
});

const createTableBtn = document.querySelector('#btn-create-table');

createTableBtn.addEventListener('click', () => {
  const wbLink = document.querySelector('#workbook-link').value;
  const submissionRange = document.querySelector('#submission-range').value;
  const productManager = document.querySelector('#product-manager').value;
  const thecnicalLead = document.querySelector('#thecnical-lead').value;
  const multiConfigLink = document.querySelector('#multi-config-link').value;
  const isOdm = document.querySelector('#enable-odm').checked;

  const radioTypes = document.querySelectorAll('input[name=description-type]');
  let company = '';

  for (const radio of radioTypes) {
    if (radio.checked) {
      company = radio.value;
    }
  }

  localStorage.setItem('wbLink', wbLink);
  localStorage.setItem('submissionRange', submissionRange);
  localStorage.setItem('company', company);
  localStorage.setItem('productManager', productManager);
  localStorage.setItem('thecnicalLead', thecnicalLead);
  localStorage.setItem('multiConfigLink', multiConfigLink);
  localStorage.setItem('isOdm', isOdm);
  localStorage.setItem('kitsCreated', JSON.stringify([]));
});

const projectTypeContainer = document.querySelector('#project-type-container');

projectTypeContainer.innerHTML = `<span style="font-weight:bold; font-size: 1.5rem">Project Type</span>`;

const projectTypes = ['svnkit', 'dpm', 'control cr'];

for (const projectType of projectTypes) {
  const p = document.createElement('p');
  const label = document.createElement('label');
  const input = document.createElement('input');

  input.name = 'project-type-radio';
  input.type = 'radio';
  input.value = projectType;

  input.addEventListener('click', (e) => {
    const projectSelected = e.target.value;
    const projectOptionsContainer = document.querySelector('#project-options-container');
    const svnkitOptionsContainer = document.querySelector('#svnkit-options-container');
    const dpmOptionsContainer = document.querySelector('#dpm-options-container');
    const rangeSelectionContainer = document.querySelector('#project-range-selection-container')

    projectOptionsContainer.classList.remove('hide');

    [svnkitOptionsContainer, dpmOptionsContainer, rangeSelectionContainer].forEach((container) =>
      container.classList.add('hide'),
    );

    if (projectSelected === 'svnkit') {
      submitUrl = 'svnkitTable.html';
      svnkitOptionsContainer.innerHTML = '';
      svnkitOptionsContainer.classList.remove('hide');
      rangeSelectionContainer.classList.remove('hide')

      const descriptionOptionsContainer = document.createElement('div');
      descriptionOptionsContainer.innerHTML = '<p>Description type</p>';

      const descriptionOptions = ['ontim', 'tinno', 'huaqin', 'longcheer'];

      for (const [index, option] of descriptionOptions.entries()) {
        const p = document.createElement('p');

        p.innerHTML = `
          <label>
            <input
              name="description-type"
              type="radio"
              value=${option}
              ${index == 0 ? 'checked' : ''}
            />
            <span>${option}</span>
          </label>
        `;

        descriptionOptionsContainer.appendChild(p);
      }

      svnkitOptionsContainer.appendChild(descriptionOptionsContainer);
    } else if (projectSelected === 'dpm') {
      submitUrl = 'dpmTable.html';
      dpmOptionsContainer.classList.remove('hide');
      rangeSelectionContainer.classList.remove('hide')

      document.querySelector('#enable-multi-config').addEventListener('click', (e) => {
        const inputMultiConfig = document.querySelector('#multi-config-link');

        if (e.target.checked) {
          inputMultiConfig.disabled = false;
          inputMultiConfig.value = DPM_MULTI_CONFIG_RULES_URL;
        } else {
          inputMultiConfig.disabled = true;
          inputMultiConfig.value = '';
        }
      });
    } else if (projectSelected === 'control cr') {
      submitUrl = 'controlCrForm.html';
    }

    createTableBtn.classList.remove('hide');
  });

  const span = document.createElement('span');
  span.innerText = projectType.toUpperCase();

  label.appendChild(input);
  label.appendChild(span);

  p.appendChild(label);

  projectTypeContainer.appendChild(p);
}
