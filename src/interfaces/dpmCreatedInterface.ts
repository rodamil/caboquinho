export default interface IDpmCreated {
  key: string;
  bvsDeltaFormated: string;
  bvsSourceFormated: string;
  bvsTargetFormated: string;
  sourceSha1: string;
  targetSha1: string;
  fingerprint: string;
  version: string;
  buildSource: string;
  buildTarget: string;
  androidOsSource: string;
  androidOsTarget: string;
  swType: string;
  formatedIsMultiConfigField: string;
  formatedProjectClassification: string;
  componentName: string;
}
