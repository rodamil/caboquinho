const { svnkitModel } = require('../models');

const SVNKIT_PROJECT_ID = '19280';
const SVNKIT_ISSUE_TYPE_ID = '108';

async function create(svnkitData, authorization, url) {
  try {
    const isDualSim = svnkitData['SS / DS'] === 'DS';
    const hasESIM = svnkitData['ESIM'] === 'TRUE';

    let dualSimField = '47545'; // false
    let simCardSlotsField = 'psim';
    let updateInfo = {
      customfield_16113: [{ set: svnkitData['RO.CARRIER'] }], // Channel Model Name
    };

    if (isDualSim) {
      dualSimField = '47544'; //true

      if (hasESIM) {
        simCardSlotsField = 'psim + esim';
      } else {
        simCardSlotsField = 'psim + psim';
      }
    }

    if (svnkitData['CHANNEL ID'] === '0x00') {
      updateInfo['customfield_22610'] = [{ set: svnkitData['RO.CARRIER'] }]; // Carrier UTAG
      delete updateInfo['customfield_16113'];
    }

    const requestBody = {
      update: updateInfo,
      fields: {
        project: { id: SVNKIT_PROJECT_ID },
        issuetype: { id: SVNKIT_ISSUE_TYPE_ID },
        summary: `${svnkitData['CARRIER COUNTRY']}: New SVN Kit request for ${svnkitData['MODEL']} ${svnkitData['PROJECT NAME']}`,
        description: svnkitData['DESCRIPTION'].split('\\').join('\n'),
        customfield_14810: svnkitData['PROJECT NAME'],
        customfield_14811: svnkitData['MODEL'],
        customfield_10407: { value: svnkitData['CARRIER COUNTRY'] },
        customfield_14813: `${svnkitData['PROJECT NAME']} ${svnkitData['SS / DS']} ${svnkitData['MODEL']}`,
        customfield_16112: svnkitData['CHANNEL ID'],
        customfield_14825: svnkitData['SOFTWARE TA'],
        customfield_22021: svnkitData['SOFTWARE TA'],
        customfield_24713: { id: dualSimField },
        customfield_25528: { value: simCardSlotsField },
        customfield_14827: svnkitData['FINGERPRINT'],
        customfield_14828: svnkitData['BOOTLOADER'],
        customfield_14831: { name: svnkitData['TAM'] },
        customfield_14821: [{ name: svnkitData['PRODUCT MANAGER'] }],
        customfield_14832: { value: 'No' },
        customfield_14833: { value: 'CFC' },
        customfield_13316: `No||CFC||${svnkitData['SIGNED']}|| ||SOFTWARE ${svnkitData['MODEL']} ${svnkitData['CARRIER COUNTRY']} ${svnkitData['SOFTWARE TA']} CFC|| || || || ||\nNo||MBN||a|| ||a|| || || || ||\nNo||RAMLoader||aa|| ||aa|| || || || ||`,
        customfield_24714: { value: svnkitData['LANGUAGE'] },
      },
    };

    const kitResponse = await svnkitModel.create(
      requestBody,
      authorization,
      url,
    );

    return kitResponse;
  } catch (err) {
    if (err.response.status == 400) {
      throw new Error('invalidKitEntry');
    } else {
      throw new Error('internalError');
    }
  }
}

module.exports = { create };
