function formatString(string, isId = false) {
  if (string) {
    if (isId) {
      return string.trim().split('.').join('-').split(' ').join('-').trim();
    } else {
      return string.trim();
    }
  } else {
    return '';
  }
}

function unformatString(string) {
  if (string) {
    return string.split('-').join(' ').replace(/[0-9]/g, '').trim();
  } else {
    return '';
  }
}

function cammelCaseToTitleCase(string) {
  // https://stackoverflow.com/questions/7225407/convert-camelcasetext-to-title-case-text
  const result = string.replace(/([A-Z])/g, ' $1');
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
}

function generateRandomHexColor() {
  // https://stackoverflow.com/questions/13833463/how-do-i-generate-a-random-hex-code-that-of-a-lighter-color-in-javascript
  const red = Math.floor(Math.random() * 106) + 150;
  const green = Math.floor(Math.random() * 106) + 150;
  const blue = Math.floor(Math.random() * 106) + 150;

  return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
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

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function handleEnableStatusBtns(status) {
  const btnsContainer = document.querySelector('#buttons-container');
  const btns = btnsContainer.querySelectorAll('button');

  for (const btn of btns) {
    btn.disabled = status;
  }
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

      if (cellKey == 'E LABEL FILE') {
        cellKey = 'E-LABEL FILE';
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

module.exports = {
  formatString,
  unformatString,
  cammelCaseToTitleCase,
  generateRandomHexColor,
  createDataList,
  capitalizeFirstLetter,
  getTableRowsData,
  handleEnableStatusBtns,
};
