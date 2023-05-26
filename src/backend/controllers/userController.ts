import { Request, Response } from 'express';
import https from 'https';
import { userService } from '../services';

let BASE_IDART_URL = '';

if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
  BASE_IDART_URL = 'https://idart-test.mot.com';
} else {
  BASE_IDART_URL = 'https://idart.mot.com';
}

async function makeLogin(req: Request, res: Response): Promise<any> {
  const { username, password } = req.body;

  const token = await userService.makeLogin(username, password, BASE_IDART_URL);

  return res.status(200).json({ token });
}

export default { makeLogin };
