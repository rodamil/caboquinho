const {
  getTamNames,
  getLanguages,
  getChannelIds,
  getProjectNames,
  getJsvnkitCarriers,
} = require('../scripts/getLists');
const { getSheet } = require('../scripts/handleSheet');
const {
  getPositionsInSubmission,
  getRowsWithData,
} = require('../scripts/handleDataInSubmission');
const {
  getRowsData,
  setDescriptionAndSwVersion,
  setCheck,
  createSvnkit,
  compareToCheck,
  updateSvnkitFieldInWB,
} = require('../scripts/handleSvnkitData');
const {
  formatString,
  createDataList,
  getTableRowsData,
  handleEnableStatusBtns,
} = require('../scripts/utils');

// Global data
let SVNKITS_BASE_URL = 'https://idart.mot.com/browse/';

if (process.env.NODE_ENV === 'development') {
  SVNKITS_BASE_URL = 'https://idart-test.mot.com/browse/';
}

const selectedCellColor = '#FF9800';
const defaultCheckedRowColor = '#FFFFFF';
const defaultUncheckRowColor = '#BABFC4';
const userUncheckRowColor = '#BAFFFF';
const kitCreatedRowColor = '#00FF00';
const kitNotCreatedRowColor = '#EA7174';
let lastActiveBackground = '';
const esimOptions = ['TRUE', 'FALSE'];

let tamNames = [];
let languages = [];
let channels = [];
let projectNames = [];
let jsvnkitCarriersList = [];
let worksheet;
let titlePositions;
let wbLink = '';

window.onload = async () => {
  wbLink = localStorage.getItem('wbLink');
  const productManager = localStorage.getItem('productManager');
  const company = localStorage.getItem('company');
  const submissionRange = localStorage.getItem('submissionRange');

  const checkIsEmpty = [
    [wbLink, "Workbook link can't be empty"],
    [productManager, "Product Managar can't be empty"],
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
    const [
      tamNamesData,
      languagesData,
      channelIdsData,
      projectNamesData,
      jsvnkitCarriersData,
    ] = await Promise.all([
      getTamNames(),
      getLanguages(),
      getChannelIds(),
      getProjectNames(),
      getJsvnkitCarriers(),
    ]);

    tamNames = [...new Set(tamNamesData.map(({ coreId }) => coreId))];
    languages = [...new Set(languagesData.map(({ language }) => language))];
    channels = [...new Set(channelIdsData.map(({ channelId }) => channelId))];
    projectNames = [...new Set(projectNamesData)];
    jsvnkitCarriersList = [...new Set(jsvnkitCarriersData)];

    worksheet = await getSheet(wbLink);

    titlePositions = getPositionsInSubmission(worksheet, 'svnkit');

    const wbRows = getRowsWithData({ worksheet, titlePositions, submissionRange });

    const rowsData = getRowsData({
      wbRows,
      titlePositions,
      tamNamesData,
      channelIdsData,
      jsvnkitCarriersData,
      productManager,
      languagesData,
    });

    const rowsFormated = setDescriptionAndSwVersion(rowsData, company);
    const rowsChecked = setCheck(rowsFormated);

    generateActionBtns();
    createSvnkitTable(rowsChecked);
  } catch (error) {
    console.log(error);
    window.alert(error);
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

function checkKitAlreadyCreated(rowData) {
  const kitsAlreadyCreated = JSON.parse(localStorage.getItem('kitsCreated'));
  const findedKit = kitsAlreadyCreated.find((kitCreated) =>
    compareToCheck({
      compareData: rowData,
      target: kitCreated['SOFTWARE TA'],
      elabel: kitCreated['E-LABEL FILE'],
      rocarrier: kitCreated['RO.CARRIER'],
      subsidy: kitCreated['SUBSIDY LOCK'],
      model: kitCreated['MODEL'],
    }),
  );

  return findedKit;
}

function generateActionBtns() {
  const btnsContainer = document.querySelector('#buttons-container');
  btnsContainer.style = 'margin-block: 2rem';

  const btnsData = [
    {
      label: 'create kits',
      actionFunc: async () => {
        handleEnableStatusBtns(true);
        const allChecks = document.querySelectorAll('input[type=checkbox]:checked');

        const confirmCreation = window.confirm(
          `You are about to create ${allChecks.length} Kits, are you sure?`,
        );

        if (confirmCreation) {
          const rowsData = getTableRowsData(false);
          const tableHeaders = document.querySelectorAll('th');
          const svnkitHeader = [...tableHeaders].find((th) => th.innerText === 'SVNKIT');
          svnkitHeader.style.display = 'table-cell';
          const currentKitsCreated = JSON.parse(localStorage.getItem('kitsCreated'));

          await Promise.all(
            rowsData.map(async (rowData, i) => {
              const svnkitInput = document.querySelector(`#SVNKIT-${i}`);
              const svnkitCell = svnkitInput.closest('td');
              const svnkitRow = svnkitCell.closest('tr');
              svnkitCell.style.display = 'table-cell';

              if (rowData['CHECK'] === true) {
                const findedKit = checkKitAlreadyCreated(rowData);

                if (!findedKit) {
                  const kitCreated = await createSvnkit(
                    rowData,
                    localStorage.getItem('token'),
                  );

                  if (kitCreated.key) {
                    const kitCreatedData = {
                      'SOFTWARE TA': rowData['SOFTWARE TA'],
                      'E-LABEL FILE': rowData['E-LABEL FILE'],
                      'RO.CARRIER': rowData['RO.CARRIER'],
                      'SUBSIDY LOCK': rowData['SUBSIDY LOCK'],
                      MODEL: rowData['MODEL'],
                      svnkit: kitCreated.key,
                    };

                    currentKitsCreated.push(kitCreatedData);
                    localStorage.setItem(
                      'kitsCreated',
                      JSON.stringify(currentKitsCreated),
                    );

                    document.querySelector(`#CHECK-${i}`).checked = false;
                    svnkitRow.style.backgroundColor = kitCreatedRowColor;
                    svnkitInput.value = kitCreated.key;
                  } else {
                    svnkitRow.style.backgroundColor = kitNotCreatedRowColor;
                    svnkitInput.value = 'ERROR';
                  }
                }
              }
            }),
          );
        }

        handleEnableStatusBtns(false);
      },
    },
    {
      label: 'Fill Workbook',
      actionFunc: async () => {
        handleEnableStatusBtns(true);

        const kitsCreated = JSON.parse(localStorage.getItem('kitsCreated'));

        if (kitsCreated.length > 0) {
          const confirmFilling = window.confirm(
            `You are about to fill the WB with ${kitsCreated.length} Kits, are you sure?`,
          );

          if (confirmFilling) {
            await Promise.all(
              kitsCreated.map(async (kitCreatedData) => {
                await updateSvnkitFieldInWB({
                  titlePositions,
                  worksheet,
                  kitCreatedData,
                  wbLink,
                });
              }),
            );
          }
        }

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
    htmlBtn.style = 'margin-right: 1rem; margin-block: 0.5rem';
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
    'ESIM',
    'RO.CARRIER',
    'ODM ROCARRIER',
    'E-LABEL FILE',
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

    if (!firstColumns.includes(tableTitle)) {
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
    htmlDatalist.id = formatString(datalist.column, true);

    table.appendChild(htmlDatalist);
  }

  const tBody = document.createElement('tbody');

  for (const [index, rowData] of rowsWithData.entries()) {
    const findedKit = checkKitAlreadyCreated(rowData);

    if (findedKit) {
      rowData['CHECK'] = '0';
      rowData['SVNKIT'] = findedKit.svnkit;
    } else if (rowData['SVNKIT'] !== '') {
      rowData['CHECK'] = '0';
      rowData['SVNKIT'] = rowData['SVNKIT'];
    }

    const tBodyRow = document.createElement('tr');

    for (const tableTitle of tableTitles) {
      const tBodyCell = document.createElement('td');

      tBodyCell.style =
        'max-width: 15rem; font-size: 0.9rem; border: 1px solid black; padding: 0; text-align: center';

      if (!firstColumns.includes(tableTitle)) {
        tBodyCell.style.display = 'none';
      }

      const lineChecked = rowData['CHECK'] === '1';
      const input = document.createElement('input');

      if (tableTitle === 'CHECK') {
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
          input.setAttribute('list', formatString(findedSelect.column, true));

          input.onchange = (e) => {
            const inputValue = e.target.value;

            if (!findedSelect.list.includes(inputValue)) {
              e.target.value = '';
            }
          };
        }

        input.type = 'text';
        input.style = 'width: 100%; border: none; outline: none; padding: 15px 5px';
        input.value = rowData[tableTitle] || '';

        input.onfocus = ({ target }) => {
          lastActiveBackground = target.style.backgroundColor;
          target.style.backgroundColor = selectedCellColor;
        };

        input.onblur = ({ target }) =>
          (target.style.backgroundColor = lastActiveBackground);

        if (tableTitle === 'SVNKIT') {
          input.onclick = async ({ target }) => {
            if (target.value.toLowerCase().includes('jsvnkit')) {
              await navigator.clipboard.writeText(`${SVNKITS_BASE_URL}${target.value}`);
            }
          };
        }
        tBodyCell.appendChild(input);
      }

      if (!lineChecked) {
        if (rowData['SVNKIT']) {
          tBodyRow.style.backgroundColor = kitCreatedRowColor;
        } else {
          tBodyRow.style.backgroundColor = defaultUncheckRowColor;
        }
      } else {
        tBody.style.backgroundColor = defaultCheckedRowColor;
      }

      input.id = `${formatString(tableTitle, true)}-${index}`;
      input.classList.add('browser-default', 'center-align');
      input.style.backgroundColor = 'inherit';

      tBodyRow.appendChild(tBodyCell);
    }

    tBody.appendChild(tBodyRow);
  }

  table.appendChild(tBody);
  tableContainer.appendChild(table);
}
