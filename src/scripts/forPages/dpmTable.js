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
  getRegionNames,
} = require('../scripts/getLists');

const { getRowsDataForDpm } = require('../scripts/handleDpmData');
const {
  cammelCaseToTitleCase,
  createDataList,
  formatString,
} = require('../scripts/utils');

const defaultUncheckRowColor = '#BABFC4';
const selectedCellColor = '#FF9800';
let lastActiveBackground = '';
let worksheet;
let titlePositions;
let projectNames = [];
let regionNames = [];
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
    const [
      projectNamesData,
      dpmDayRules,
      dpmUpdateRules,
      multiConfigRules,
      regionNamesData,
    ] = await Promise.all([
      getProjectNames(),
      getDpmDayRules(),
      getDpmUpdateRules(),
      getMultiConfigRules(multiConfigLink),
      getRegionNames(),
    ]);

    projectNames = projectNamesData;
    regionNames = regionNamesData;

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
    // console.log(rowsData);

    createDpmTable(rowsData);
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

function createDpmTable(rowsWithData) {
  const firstColumns = ['check', 'rocarrierField', 'source', 'target'];
  const columnsToHide = ['bgGroupColor'];

  let tableTitles = Object.keys(rowsWithData[0]);
  tableTitles = tableTitles.filter((title) => !firstColumns.includes(title));
  tableTitles = [...firstColumns, ...tableTitles];

  const tableContainer = document.querySelector('#dpm-table');
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  table.style = 'box-shadow: 50px 50x';

  const tHead = document.createElement('thead');
  const tHeadRow = document.createElement('tr');

  for (const tableTitle of tableTitles) {
    const tHeadCell = document.createElement('th');
    tHeadCell.innerText = cammelCaseToTitleCase(tableTitle);
    tHeadCell.style =
      'min-width: 15rem; border: 1px solid black; background-color: inherit';
    tHeadCell.classList.add('center-align');

    if (columnsToHide.includes(tableTitle)) {
      tHeadCell.style.display = 'none';
    }

    tHeadRow.appendChild(tHeadCell);
  }

  tHeadRow.classList.add('orange', 'lighten-2');
  tHead.appendChild(tHeadRow);
  table.appendChild(tHead);

  const columnsWithDataList = [
    { column: 'productName', list: projectNames },
    { column: 'regionName', list: regionNames },
  ];

  for (const datalist of columnsWithDataList) {
    const htmlDatalist = createDataList(datalist.list);
    htmlDatalist.id = formatString(datalist.column);

    table.appendChild(htmlDatalist);
  }

  const tBody = document.createElement('tbody');

  for (const [index, rowData] of rowsWithData.entries()) {
    const tBodyRow = document.createElement('tr');

    for (const tableTitle of tableTitles) {
      const tBodyCell = document.createElement('td');

      tBodyCell.style =
        'max-width: 15rem; font-size: 0.9rem; border: 1px solid black; padding: 0; text-align: center';

      if (columnsToHide.includes(tableTitle)) {
        tBodyCell.style.display = 'none';
      }

      const input = document.createElement('input');

      if (tableTitle === 'check') {
        const label = document.createElement('label');
        label.style = 'display: block';

        input.type = 'checkbox';
        input.style = 'width: 25px; height: 25px; opacity: 1; position: static';
        input.checked = rowData['check'];

        input.onclick = (e) => {
          if (e.target.checked == true) {
            tBodyRow.style.backgroundColor = rowData['bgGroupColor'];
          } else {
            tBodyRow.style.backgroundColor = defaultUncheckRowColor;
          }
        };

        label.appendChild(input);
        tBodyCell.appendChild(label);
      } else {
        const findedSelect = columnsWithDataList.find(
          ({ column }) => column === tableTitle,
        );
        if (findedSelect) {
          input.setAttribute('list', formatString(findedSelect.column));

          input.onchange = (e) => {
            const inputValue = e.target.value;

            if (!findedSelect.list.includes(inputValue)) {
              e.target.value = '';
            }
          };
        }

        tBodyRow.style.backgroundColor = rowData['bgGroupColor'];
        input.type = 'text';
        input.style = 'width: 100%; border: none; outline: none; padding: 15px 5px';
        input.value = rowData[tableTitle] || '';

        if (
          (tableTitle === 'isOdm' && !rowData[tableTitle]) ||
          (tableTitle === 'isMultiConfig' &&
            (!rowData[tableTitle] || !rowData['rocarrierField'].includes('N/A')))
        ) {
          input.value = 'false';
        }

        input.onfocus = ({ target }) => {
          lastActiveBackground = target.style.backgroundColor;
          target.style.backgroundColor = selectedCellColor;
        };

        input.onblur = ({ target }) =>
          (target.style.backgroundColor = lastActiveBackground);

        if (tableTitle === 'dpm') {
          input.onclick = async ({ target }) => {
            if (target.value.toLowerCase().includes('dpm')) {
              await navigator.clipboard.writeText(`${SVNKITS_BASE_URL}${target.value}`);
            }
          };
        }
        tBodyCell.appendChild(input);
      }

      input.id = `${formatString(tableTitle)}-${index}`;
      input.classList.add('browser-default', 'center-align');
      input.style.backgroundColor = 'inherit';

      tBodyRow.appendChild(tBodyCell);
    }

    tBody.appendChild(tBodyRow);
  }

  table.appendChild(tBody);
  tableContainer.appendChild(table);
}
