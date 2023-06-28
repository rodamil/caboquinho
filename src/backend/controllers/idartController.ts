import { Request, Response } from 'express';
import https from 'https';
import IControlCrBody from '../../interfaces/controlCrBodyInterface';
import { idartService } from '../services';

let BASE_IDART_URL = '';

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-test.mot.com';
} else {
  BASE_IDART_URL = 'https://idart.mot.com';
}

async function getNpiProjectNames(req: Request, res: Response): Promise<any> {
  const { authorization } = req.headers;

  const npiProjectNames = await idartService.getNpiProjectNames(authorization);

  return res.status(200).json(npiProjectNames);
}

async function getRegionNames(req: Request, res: Response): Promise<any> {
  const { authorization } = req.headers;

  const regionNames = await idartService.getRegionNames(authorization);

  return res.status(200).json(regionNames);
}

async function getLaunchType(req: Request, res: Response): Promise<any> {
  const { authorization } = req.headers;

  const launchTypes = await idartService.getLaunchType(authorization);

  return res.status(200).json(launchTypes);
}

async function createControlCr(req: Request, res: Response): Promise<any> {
  const { authorization } = req.headers;
  const controlCrData: IControlCrBody = req.body.controlCrData;

  const controlCrCreated = await idartService.createControlCr(
    authorization,
    controlCrData,
    BASE_IDART_URL,
  );

  return res.status(201).json(controlCrCreated);
}

export default { getNpiProjectNames, getRegionNames, getLaunchType, createControlCr };
