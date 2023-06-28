import { xml2js } from 'xml-js';
import IDpmBodyData from '../../interfaces/dpmBodyDataInterface';
import IDpmCreated from '../../interfaces/dpmCreatedInterface';
import { dpmModel } from '../models/index';

const COMPONENT_NAME = 'DPM OTA Sw Updates';
const SW_TYPE = 'streamingOnAb';

type XmlContent = {
  blurversion: {
    softwareversion: {
      _text: string;
    };
    target: {
      _text: string;
    };
    sourceDisplayVersion: { _text: string };
    displayVersion: { _text: string };
  };
  otaversion: {
    otaSourceSha1: {
      _text: string;
    };
    otaTargetSha1: {
      _text: string;
    };
  };
  fingerprint: {
    _text: string;
  };
  targetFingerPrint: {
    _text: string;
  };
};

type HandleXmlDataReturn = {
  bvsSource: string;
  bvsTarget: string;
  bvsDelta: string;
  sourceSha1: string;
  targetSha1: string;
  fingerprint: string;
  version: string;
  buildSource: string;
  buildTarget: string;
};

const handleXmlData = (xmlString: string): HandleXmlDataReturn => {
  const xmlDoc = xml2js(xmlString, { compact: true });
  const buildData: XmlContent = xmlDoc['build_data'];

  const bvsSource = buildData.blurversion.softwareversion['_text'];
  const bvsTarget = buildData.blurversion.target['_text'];

  const bvsDelta =
    bvsSource.match(/[A-z0-9.-]+[0-9]/)[0] +
    bvsTarget.match(/[0-9.]+[0-9]/)[0].replace('.', '-') +
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

const getAndroidVersion = (buildStringNumber: string): string => {
  const majorVersion = buildStringNumber[0];
  const minorVersion = (majorVersion.charCodeAt(0) - 71).toString();
  return `${majorVersion} ${minorVersion}.0`;
};

async function create(
  dpmData: IDpmBodyData,
  authorization: string,
): Promise<IDpmCreated> {
  const { xmlUrl, isOdm, isMultiConfig } = dpmData;
  const boolIsOdm: boolean = JSON.parse(isOdm);
  const boolIsMultiConfig: boolean = JSON.parse(isMultiConfig);

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

    return dpmResponse;
  } catch (err) {
    console.log(err);
    throw new Error('internalError');
  }
}

export default { create };
