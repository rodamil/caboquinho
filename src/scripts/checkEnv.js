const pjson = require('../../package.json');

if (process.env.NODE_ENV === 'development') {
  console.log('running app with test configs');
}

console.log(`Running application in version: ${pjson.version}`);
console.log('Any problem or suggestion, please, contact @rodlima');
