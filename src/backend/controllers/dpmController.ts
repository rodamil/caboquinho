import { Request, Response } from 'express';
import IDpmBodyData from '../../interfaces/dpmBodyDataInterface';
import { dpmService } from '../services';

async function create(req: Request, res: Response): Promise<any> {
  const dpmData: IDpmBodyData = req.body.dpmData;
  const { authorization } = req.headers;

  const dpmCreated = await dpmService.create(dpmData, authorization);

  return res.status(201).json(dpmCreated);
}

export default { create };
