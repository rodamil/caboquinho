const { dpmModel } = require('../models');
const { xml2js } = require('xml-js');

const COMPONENT_NAME = 'DPM OTA Sw Updates';
const SW_TYPE = 'streamingOnAb';

const handleXmlData = (xmlString) => {
  const xmlDoc = xml2js(xmlString, { compact: true });
  const buildData = xmlDoc['build_data'];

  const bvsSource = buildData.blurversion.softwareversion['_text'];
  const bvsTarget = buildData.blurversion.target['_text'];

  const bvsDelta =
    bvsSource.match(/[A-z0-9.-]+[0-9]/)[0] +
    bvsTarget.match(/[0-9.]+[0-9]/)[0].replace('.', '-', 1) +
    bvsSource.split(/[0-9]/).pop();

  const sourceSha1 = buildData.otaversion.otaSourceSha1['_text'];
  const targetSha1 = buildData.otaversion.otaTargetSha1['_text'];
  const fingerprint = buildData.fingerprint['_text'];
  const version = buildData.targetFingerPrint['_text'];
  const buildSource = buildData.blurversion.sourceDisplayVersion['_text'];
  const buildTarget = buildData.blurversion.displayVersion['_text'];

  return {
    bvsSource,
    bvsTarget,
    bvsDelta,
    sourceSha1,
    targetSha1,
    fingerprint,
    version,
    buildSource,
    buildTarget,
  };
};

const getAndroidVersion = (buildStringNumber) => {
  const majorVersion = buildStringNumber[0];
  const minorVersion = (majorVersion.charCodeAt(0) - 71).toString();
  return `${majorVersion} ${minorVersion}.0`;
};

async function create(dpmData, authorization) {
  const { xmlUrl, isOdm, isMultiConfig } = dpmData;
  const boolIsOdm = JSON.parse(isOdm);
  const boolIsMultiConfig = JSON.parse(isMultiConfig);

  try {
    if (!xmlUrl) {
      throw new Error('xmlEmpty');
    }

    const xmlString = await dpmModel.getXml(authorization, xmlUrl);
    const {
      bvsSource,
      bvsTarget,
      bvsDelta,
      sourceSha1,
      targetSha1,
      fingerprint,
      version,
      buildSource,
      buildTarget,
    } = handleXmlData(xmlString);

    let formatedProjectClassification = 'Internal';
    let bvsDeltaFormated = bvsDelta;
    let bvsSourceFormated = bvsSource;
    let bvsTargetFormated = bvsTarget;

    if (boolIsOdm) {
      formatedProjectClassification = 'ODM1';

      try {
        const splitedXmlUrl = xmlUrl.split('/');
        const xmlName = splitedXmlUrl[splitedXmlUrl.length - 1].split('.xml')[0];
        const bSource = buildSource.match('[0-9.-]+[0-9]')[0];
        const bTarget = bvsTarget.match('[0-9.-]+[0-9]')[0];
        const otaVersionText = xmlName.split('.')[0];

        bvsDeltaFormated = xmlName;
        bvsSourceFormated = `${otaVersionText}.${bSource}${xmlName.split(bTarget)[1]}`;
        bvsTargetFormated = `${otaVersionText}.${
          xmlName.split(`${otaVersionText}.${bSource}-`)[1]
        }`;
      } catch (error) {
        bvsDeltaFormated = bvsDelta;
        bvsSourceFormated = bvsSource;
        bvsTargetFormated = bvsTarget;
      }
    }

    const formatedIsMultiConfigField = boolIsMultiConfig ? 'Yes' : 'No';

    const dpmResponse = {
      key: 'created',
      bvsDeltaFormated,
      bvsSourceFormated,
      bvsTargetFormated,
      sourceSha1,
      targetSha1,
      fingerprint,
      version,
      buildSource,
      buildTarget,
      androidOsSource: getAndroidVersion(buildSource),
      androidOsTarget: getAndroidVersion(buildTarget),
      swType: SW_TYPE,
      formatedIsMultiConfigField,
      formatedProjectClassification,
      componentName: COMPONENT_NAME,
    };

    // Unnecessary yet because the Jira don't allow all users to Create a DPM by Jira API
    // const dpmResponse = await idartModel.createIssue(authorization, requestBody, url);

    return dpmResponse;
  } catch (err) {
    console.log(err);
    throw new Error('internalError');
  }
}

async function main() {
  const res = await create(
    {
      xmlUrl:
        'https://artifacts.mot.com/artifactory/borago/12/SOWS32.121-40-2/borago_retail/user/release-keys/Ota_Version.32.121-40-32.121-40-2.borago_user.retail.en-US.xml',
      isOdm: true,
      isMultiConfig: true,
    },
    'Basic cm9kbGltYTpFbGRAMjMwMw==',
  );

  console.log(res);
}
main();

module.exports = { create };
