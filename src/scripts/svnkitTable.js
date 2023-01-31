require('dotenv').config;

const {
  getTamNames,
  getLanguages,
  getChannelIds,
  getProjectNames,
  getJsvnkitCarriers,
} = require('../scripts/getSvnkitLists');
const { getSheet } = require('../scripts/handleSheet');
const { getPositionsForSvnkit } = require('../scripts/handleDataInSubmission');
const {
  getRowsData,
  setDescriptionAndSwVersion,
  setCheck,
  createSvnkit,
} = require('../scripts/handleSvnkitData');

const response = require('../mock/mock');

// Global data
let SVNKITS_BASE_URL = 'https://idart.mot.com/browse/';

if (process.env.NODE_ENV === 'development') {
  SVNKITS_BASE_URL = 'https://idart-dev.mot.com/browse/';
}

const selectedCellColor = '#FF9800';
const defaultCheckedRowColor = '#FFFFFF';
const defaultUncheckRowColor = '#BABFC4';
const userUncheckRowColor = '#BAFFFF';
let lastActiveBackground = '';
const esimOptions = ['TRUE', 'FALSE'];
let tamNames = [];
let languages = [];
let channels = [];
let projectNames = [];
let jsvnkitCarriersList = [];
let jiraToken = '';

window.onload = async () => {
  const wbLink = localStorage.getItem('wbLink');
  const productManager = localStorage.getItem('productManager');
  const company = localStorage.getItem('company');
  jiraToken = localStorage.getItem('jiraToken');

  const checkIsEmpty = [
    [wbLink, "Workbook link can't be empty"],
    [productManager, "Product Managar can't be empty"],
    [jiraToken, "Jira token can't be empty"],
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
        <h3 style="font-weight: bold; font-size" class="orange-text">Loading svnkit data...</h2>
      </div>
      <div class="btn-floating btn-large pulse orange"></div>
    </div>
  `;

  try {
    // const [
    //   tamNamesData,
    //   languagesData,
    //   channelIdsData,
    //   projectNamesData,
    //   jsvnkitCarriersData,
    // ] = await Promise.all([
    //   getTamNames(),
    //   getLanguages(),
    //   getChannelIds(),
    //   getProjectNames(),
    //   getJsvnkitCarriers(),
    // ]);

    // tamNames = [...new Set(tamNamesData.map(({ coreId }) => coreId))];
    // languages = [...new Set(languagesData.map(({ language }) => language))];
    // channels = [...new Set(channelIdsData.map(({ channelId }) => channelId))];
    // projectNames = [...new Set(projectNamesData)];
    // jsvnkitCarriersList = [...new Set(jsvnkitCarriersData)];

    // const worksheet = await getSheet(wbLink);
    // const titlePositions = getPositionsForSvnkit(worksheet);

    // const rowsData = getRowsData({
    //   worksheet,
    //   titlePositions,
    //   tamNamesData,
    //   channelIdsData,
    //   jsvnkitCarriersData,
    //   productManager,
    //   languagesData,
    // });

    // const rowsFormated = setDescriptionAndSwVersion(rowsData);
    // const rowsChecked = setCheck(rowsFormated);
    projectNames = response.project_list;
    awaitContainer.innerHTML = '';
    document.querySelector('#page-title').innerText = 'Caboquinho';
    generateActionBtns();
    createSvnkitTable(response.checkedRows);
  } catch (error) {
    window.alert(error);
    // window.window..back();
  }
};

function formatString(string) {
  return string.split('.').join('-').split(' ').join('-').trim();
}

function unformatString(string) {
  return string.split('-').join(' ').replace(/[0-9]/g, '').trim();
}

function createDataList(options) {
  const datalist = document.createElement('datalist');

  for (const option of options) {
    const htmlOption = document.createElement('option');
    htmlOption.value = option;
    datalist.appendChild(htmlOption);
  }

  return datalist;
}

function getTableRowsData(removeCheck = true) {
  const tRows = document.querySelector('tbody').querySelectorAll('tr');
  const rowsData = [];

  for (const tRow of tRows) {
    const tCells = tRow.querySelectorAll('td');
    const currentRowData = {};

    for (const tCell of tCells) {
      const inputCell = tCell.querySelector('input');
      let cellKey = unformatString(inputCell.id);

      if (cellKey == 'RO CARRIER') {
        cellKey = 'RO.CARRIER';
      }

      if (inputCell.type === 'checkbox') {
        const cellValue = inputCell.checked;

        currentRowData[cellKey] = cellValue;
      } else {
        const cellValue = inputCell.value;

        currentRowData[cellKey] = cellValue;
      }
    }

    if (removeCheck) {
      delete currentRowData['CHECK'];
    }

    rowsData.push(currentRowData);
  }

  return rowsData;
}

function handleEnableStatusBtns(status) {
  const btnsContainer = document.querySelector('#buttons-container');
  const btns = btnsContainer.querySelectorAll('button');

  for (const btn of btns) {
    btn.disabled = status;
  }
}

function generateActionBtns() {
  const btnsContainer = document.querySelector('#buttons-container');
  btnsContainer.style = 'margin-block: 2rem';

  const btnsData = [
    {
      label: 'home',
      actionFunc: () => {
        const response = window.confirm(
          'You will lose your changes, do you really want to go back?',
        );
        if (response) {
          window.location = 'loginForm.html';
        }
      },
    },
    {
      label: 'create kits',
      actionFunc: async () => {
        handleEnableStatusBtns(true);
        const rowsData = getTableRowsData(false);
        const tableHeaders = document.querySelectorAll('th');
        const svnkitHeader = [...tableHeaders].find(
          (th) => th.innerText === 'SVNKIT',
        );
        svnkitHeader.style.display = 'table-cell';

        await Promise.all(
          rowsData.map(async (rowData, i) => {
            const svnkitInput = document.querySelector(`#SVNKIT-${i}`);

            svnkitInput.closest('td').style.display = 'table-cell';
            if (rowData['CHECK'] === true) {
              const kitCreated = await createSvnkit(rowData, jiraToken);
              if (kitCreated.key) {
                svnkitInput.value = `${SVNKITS_BASE_URL}${kitCreated.key}`;
              } else {
                svnkitInput.value = 'ERROR';
              }
            } else {
              svnkitInput.value = 'N/A';
            }
          }),
        );

        handleEnableStatusBtns(false);
      },
    },
    {
      label: 'run check',
      actionFunc: () => {
        const rowsData = getTableRowsData();
        const checkedRows = setCheck(rowsData);
        createSvnkitTable(checkedRows);
      },
    },
    {
      label: 'uncheck all',
      actionFunc: () => {
        const tRows = document.querySelector('tbody').querySelectorAll('tr');

        for (const tRow of tRows) {
          const checkBox = tRow.querySelector('input[type="CHECKBOX"]');
          checkBox.checked = false;
          tRow.style.backgroundColor = defaultUncheckRowColor;
        }
      },
    },
  ];

  for (const btn of btnsData) {
    const htmlBtn = document.createElement('button');
    htmlBtn.className = 'waves-effect waves-light btn-large';
    htmlBtn.style = 'margin-right: 1rem';
    htmlBtn.innerHTML = btn.label;
    htmlBtn.onclick = btn.actionFunc;
    btnsContainer.appendChild(htmlBtn);
  }
}

function createSvnkitTable(rowsWithData) {
  const firstColumns = [
    'SVNKIT',
    'CHECK',
    'CARRIER',
    'COUNTRY',
    'CARRIER COUNTRY',
    'TAM',
    'PROJECT NAME',
    'MODEL',
  ];
  const columnsDisplayNone = [
    'SVNKIT',
    'PRODUCT MANAGER',
    'LANGUAGE',
    'CHANNEL ID',
    'SS / DS',
    'SOFTWARE TA',
    'SUBSIDY LOCK',
    'LABEL FILE',
    'SIGNED',
    'MEMORY',
    'FINGERPRINT',
    'BOOTLOADER',
    'TARGET PRODUCT',
    'ODM ROCARRIER',
    'SW VERSION',
    'DESCRIPTION',
  ];

  let tableTitles = Object.keys(rowsWithData[0]);
  tableTitles = tableTitles.filter((title) => !firstColumns.includes(title));
  tableTitles = [...firstColumns, ...tableTitles];

  const tableContainer = document.querySelector('#svnkits-table');
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  table.style = 'box-shadow: 50px 50x';

  const tHead = document.createElement('thead');
  const tHeadRow = document.createElement('tr');

  for (const tableTitle of tableTitles) {
    const tHeadCell = document.createElement('th');
    tHeadCell.innerText = tableTitle;
    tHeadCell.style =
      'min-width: 15rem; border: 1px solid black; background-color: inherit';
    tHeadCell.classList.add('center-align');

    if (columnsDisplayNone.includes(tableTitle)) {
      tHeadCell.style.display = 'none';
    }

    tHeadRow.appendChild(tHeadCell);
  }

  tHeadRow.classList.add('orange', 'lighten-2');
  tHead.appendChild(tHeadRow);
  table.appendChild(tHead);

  const columnsWithDataList = [
    { column: 'TAM', list: tamNames },
    { column: 'LANGUAGE', list: languages },
    { column: 'CHANNEL ID', list: channels },
    { column: 'PROJECT NAME', list: projectNames },
    { column: 'CARRIER COUNTRY', list: jsvnkitCarriersList },
    { column: 'ESIM', list: esimOptions },
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

      if (columnsDisplayNone.includes(tableTitle)) {
        tBodyCell.style.display = 'none';
      }

      const lineChecked = rowData['CHECK'] === '1';
      const input = document.createElement('input');

      if (tableTitle == 'CHECK') {
        const label = document.createElement('label');
        label.style = 'display: block';

        input.type = 'checkbox';
        input.style = 'width: 25px; height: 25px; opacity: 1; position: static';
        input.checked = lineChecked;

        input.onclick = (e) => {
          if (e.target.checked == true) {
            tBodyRow.style.backgroundColor = defaultCheckedRowColor;
          } else {
            tBodyRow.style.backgroundColor = userUncheckRowColor;
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

        input.type = 'text';
        input.style =
          'width: 100%; border: none; outline: none; padding: 15px 5px';
        input.value = rowData[tableTitle] || '';

        input.onfocus = ({ target }) => {
          lastActiveBackground = target.style.backgroundColor;
          target.style.backgroundColor = selectedCellColor;
        };

        input.onblur = ({ target }) =>
          (target.style.backgroundColor = lastActiveBackground);

        tBodyCell.appendChild(input);
      }

      if (!lineChecked) {
        tBodyRow.style.backgroundColor = defaultUncheckRowColor;
      } else {
        tBody.style.backgroundColor = defaultCheckedRowColor;
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
