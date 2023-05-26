import { Request, Response } from 'express';
import { dpmService } from '../services';

async function create(req: Request, res: Response): Promise<any> {
  const { dpmData } = req.body;
  const { authorization } = req.headers;

  const dpmCreated = await dpmService.create(dpmData, authorization);

  return res.status(201).json(dpmCreated);
}

export default { create };
