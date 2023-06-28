import axios from 'axios';

type LoginReturn = {
  session: {
    name: string;
    value: string;
  };
  loginInfo: {
    failedLoginCount: string;
    loginCount: string;
    lastFailedLoginTime: string;
    previousLoginTime: string;
  };
};
async function makeLogin(
  username: string,
  password: string,
  url: string,
): Promise<LoginReturn> {
  const { data } = await axios.post<LoginReturn>(`${url}/rest/auth/1/session`, {
    username,
    password,
  });

  return data;
}

export default { makeLogin };
