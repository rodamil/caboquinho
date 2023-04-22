const { dpmModel } = require('../models');
const { xml2js } = require('xml-js');

const DPM_PROJECT_ID = '40680';
const DPM_ISSUE_TYPE_ID = '13806';
const COMPONENT_NAME = 'DPM OTA Sw Updates';
const SW_TYPE = 'streamingOnAb';

const dpmData = {
  bgGroupColor: '#ED9720',
  check: '1',
  summary: 'DEVONF_G - XT2237-1 - Retail Brazil - DS - T1TNS33.14-44-2-1 - T1TN33.14-60',
  rocarrierField: 'retbr',
  cds: 'https://moto-cdsp.appspot.com/upgrades#/paths/edit/948c1032-3fb9-47f8-8a02-9adb9a61281f',
  xmlUrl:
    'https://artifacts.mot.com/artifactory/devonf_US/13/T1TN33.14-60/devonf_g_sys/user/release-keys_cid50/OTA_FROM_T1TNS33.14-32-4-1_TO_T1TN33.14-60_V1/ab_dp_delta-Ota_Version_devonf_g_sys_T1TNS33.14-32-4-1-T1TN33.14-60_release-keys.xml',
  productName: 'Devon5G23 Latam DS',
  model: 'XT2237-1',
  source: 'T1TNS33.14-44-2-1',
  target: 'T1TN33.14-60',
  deivceIdField: ['101204', '101205'],
  regionName: 'Latin America',
  launchCountriesField: ['Brazil'],
  carriersCountriesField: ['Retail - Brazil', 'Claro - Brazil'],
  launchType: 'MR2',
  packLocation:
    'https://artifacts.mot.com/artifactory/devonf_US/13/T1TN33.14-60/devonf_g_sys/user/release-keys_cid50/',
  packSanity:
    'https://drive.google.com/drive/folders/1WXb-FMRb7wgdkZkmS_zG9_Muqau5zbqv?usp=share_link',
  forcedUpgrade: 'FALSE',
  downdloadWifiOnly: 'TRUE',
  showPreDownloadMsg: 'TRUE',
  showDownloadOptions: 'FALSE',
  botaTextLink:
    'https://drive.google.com/drive/folders/1kJfZISKNYAsjhU6fwMDomQQ6CTtH33aG',
  releaseNotesLink: 'https://N/A',
  md5: '3aa782367934de6393d7dd3837b3944b',
  packageSize: '978.63',
  listOfDevices: 'Devon_5G_npi',
  wbLink:
    'https://docs.google.com/spreadsheets/d/1wEedGykH3iwCsuLoBgsJ_AMJPNoYnlBWbhcXM6QiY_o/edit#gid=1958962067',
  productManager: 'aurelioc',
  technicalLead: 'igoro',
  rocarrierPlannedField: ['retbr'],
  isMultiConfig: true,
  isOdm: false,
};

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

const mapArrayToString = (list) =>
  list.reduce((prev, curr, index) => {
    if (index === 0) {
      return curr.trim();
    } else {
      return `${prev}, ${curr.trim()}`;
    }
  }, '');

const getAndroidVersion = (buildStringNumber) => {
  const majorVersion = buildStringNumber[0];
  const minorVersion = (majorVersion.charCodeAt(0) - 71).toString();
  return `${majorVersion} ${minorVersion}.0`;
};

async function create(authorization, url) {
  const {
    summary,
    xmlUrl,
    isOdm,
    rocarrierField,
    cds,
    productName,
    model,
    target,
    deivceIdField,
    regionName,
    launchCountriesField,
    carriersCountriesField,
    launchType,
    packLocation,
    packSanity,
    forcedUpgrade,
    downdloadWifiOnly,
    showPreDownloadMsg,
    showDownloadOptions,
    botaTextLink,
    md5,
    packageSize,
    listOfDevices,
    productManager,
    wbLink,
    technicalLead,
    isMultiConfig,
    rocarrierPlannedField,
    releaseNotesLink,
  } = dpmData;

  try {
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

    if (isOdm) {
      formatedProjectClassification = 'ODM1';

      try {
        const splitedXmlUrl = xmlUrl.split('/');
        const xmlName = splitedXmlUrl[splitedXmlUrl.length - 1].split('.xml')[0];
        const bSource = buildSource.match('[0-9.-]+[0-9]')[0];
        const bTarget = bvsTarget.match('[0-9.-]+[0-9]')[0];

        bvsDeltaFormated = xmlName;
        bvsSourceFormated = `${xmlName.split('.')[0]}.${bSource}${
          xmlName.split(bTarget)[1]
        }`;
        bvsTargetFormated = `${xmlName.split('.')[0]}.${xmlName.split(bSource + '-')[1]}`;
      } catch (error) {
        bvsDeltaFormated = bvsDelta;
        bvsSourceFormated = bvsSource;
        bvsTargetFormated = bvsTarget;
      }
    }

    const formatedDeviceIds = mapArrayToString(deivceIdField);
    const formatedLaunchCountries = launchCountriesField.join(',');
    const formatedLaunchCarriers = carriersCountriesField.join(',');
    const formatedIsMultiConfigField = isMultiConfig ? 'Yes' : 'No';
    const formatedRocarrierPlaned = rocarrierPlannedField.join(',');

    const requestBody = {
      fields: {
        project: { id: DPM_PROJECT_ID },
        issuetype: { id: DPM_ISSUE_TYPE_ID },
        summary,
        components: [{ name: COMPONENT_NAME }],
        customfield_26162: bvsDeltaFormated,
        customfield_26137: bvsSourceFormated,
        customfield_26163: bvsTargetFormated,
        customfield_25224: { value: rocarrierField },
        customfield_25961: cds,
        customfield_11142: productName,
        customfield_14811: model,
        customfield_23011: sourceSha1,
        customfield_26230: targetSha1,
        customfield_14827: fingerprint,
        customfield_11164: version,
        customfield_26164: buildSource,
        customfield_26165: target,
        customfield_26166: formatedDeviceIds,
        customfield_16822: regionName,
        customfield_16730: formatedLaunchCountries,
        customfield_16731: formatedLaunchCarriers,
        customfield_16823: launchType,
        customfield_26063: { value: getAndroidVersion(buildSource) },
        customfield_26062: { value: getAndroidVersion(buildTarget) },
        customfield_25962: packLocation,
        customfield_25963: packSanity,
        customfield_26026: { value: forcedUpgrade },
        customfield_26027: { value: downdloadWifiOnly },
        customfield_26028: { value: showPreDownloadMsg },
        customfield_25994: { value: showDownloadOptions },
        customfield_25942: botaTextLink,
        customfield_25943: releaseNotesLink,
        customfield_26171: md5,
        customfield_25973: packageSize,
        customfield_26172: listOfDevices,
        customfield_15713: [{ name: productManager }],
        customfield_25966: wbLink,
        customfield_25919: { value: SW_TYPE },
        customfield_12910: [{ name: technicalLead }],
        customfield_14817: { value: formatedIsMultiConfigField },
        customfield_26257: formatedRocarrierPlaned,
        customfield_25516: formatedProjectClassification,
      },
    };
    console.log(requestBody);
    const dpmResponse = await dpmModel.create(authorization, requestBody, url);
    console.log(dpmResponse);

    return dpmResponse;
  } catch (err) {
    // if (err.response.status == 400) {
    //   throw new Error('invalidDpmEntry');
    // } else {
    //   throw new Error('internalError');
    // }
  }
}
create('Basic cm9kbGltYTpFbGRAMjMwMg==', 'https://idart-test.mot.com');
module.exports = { create };
