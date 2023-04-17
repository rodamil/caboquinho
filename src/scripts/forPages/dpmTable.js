const {
  getPositionsInSubmission,
  getRowsWithData,
} = require('../scripts/handleDataInSubmission');

const { getSheet } = require('../scripts/handleSheet');
const {
  getProjectNames,
  getDpmUpdateRules,
  getDpmDayRules,
  getMultiConfigRules,
} = require('../scripts/getLists');

const { getRowsDataForDpm } = require('../scripts/handleDpmData');

let worksheet;
let titlePositions;
let projectNames = [];
let wbLink = '';

window.onload = async () => {
  const productManager = localStorage.getItem('productManager');
  const thecnicalLead = localStorage.getItem('thecnicalLead');
  const submissionRange = localStorage.getItem('submissionRange');
  const isOdm = JSON.parse(localStorage.getItem('isOdm'));
  const multiConfigLink = localStorage.getItem('multiConfigLink');
  wbLink = localStorage.getItem('wbLink');

  const checkIsEmpty = [
    [wbLink, "Workbook link can't be empty"],
    [productManager, "Product Managar can't be empty"],
    [thecnicalLead, "Thecnical Lead can't be empty"],
  ];

  for (const item of checkIsEmpty) {
    const [elem, message] = item;

    if (!elem) {
      window.alert(message);
      window.history.back();
      break;
    }
  }

  const awaitContainer = document.querySelector('#awaiting-content');

  awaitContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 90vh; justify-content: center; align-items: center">
      <div>
        <h3 style="font-weight: bold; font-size" class="orange-text">Loading dpm data...</h2>
      </div>
      <div class="btn-floating btn-large pulse orange"></div>
    </div>
  `;

  try {
    const [projectNamesData, dpmDayRules, dpmUpdateRules, multiConfigRules] =
      await Promise.all([
        getProjectNames(),
        getDpmDayRules(),
        getDpmUpdateRules(),
        getMultiConfigRules(multiConfigLink),
      ]);

    projectNames = projectNamesData;

    worksheet = await getSheet(wbLink);
    titlePositions = getPositionsInSubmission(worksheet, 'dpm');

    const wbRows = getRowsWithData({ worksheet, titlePositions, submissionRange });

    const rowsData = getRowsDataForDpm({
      wbRows,
      titlePositions,
      productManager,
      thecnicalLead,
      submissionRange,
      isOdm,
      multiConfigLink,
      dpmDayRules,
      dpmUpdateRules,
      multiConfigRules,
    });
    console.log(rowsData);

    // console.log(rowsData);
  } catch (error) {
    console.log(error);
    // window.alert(error)
  }

  awaitContainer.innerHTML = '';

  document.querySelector('header').classList.remove('hide');

  document.querySelector('#btn-go-back').addEventListener('click', () => {
    const response = window.confirm(
      'You will lose your changes, do you really want to go back?',
    );
    if (response) {
      history.back();
    }
  });
};
