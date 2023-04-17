function formatString(string) {
  if (string) {
    return string.split('.').join('-').split(' ').join('-').trim();
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

module.exports = { formatString, unformatString };
