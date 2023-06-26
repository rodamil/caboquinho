const pjson = require('../../package.json');

const generalInfoCss =
  'background: #222; color: #bada55; font-size: 1rem; font-weight: bold; padding: 10px';

const highlightItem =
  'background: #222; color: #ffff00; font-size: 1rem; font-weight: bold; padding-block: 10px';

if (process.env.NODE_ENV === 'development') {
  console.log('%crunning app with test configs', generalInfoCss);
}

console.log(
  `
%cApp version: ${pjson.version};
Remember to share your sheets with the email: %cnpi-dev@npi-dev-374516.iam.gserviceaccount.com%c;
Any problem or suggestion, please, contact: %c@rodlima%c.`,
  generalInfoCss,
  highlightItem,
  generalInfoCss,
  highlightItem,
  generalInfoCss,
);
