import { Request, Response } from 'express';
import https from 'https';
import ISvnkitData from '../../interfaces/svnkitDataInterface';
import { svnkitService } from '../services';

let BASE_IDART_URL = '';

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-test.mot.com';
} else {
  BASE_IDART_URL = 'https://idart.mot.com';
}

async function create(req: Request, res: Response): Promise<any> {
  const svnkitData: ISvnkitData = req.body.svnkitData;
  const { authorization } = req.headers;

  const kitCreated = await svnkitService.create(
    svnkitData,
    authorization,
    BASE_IDART_URL,
  );

  return res.status(201).json(kitCreated);
}

export default { create };
