const errors = {
  invalidCredentials: {
    code: 401,
    message: 'Your coreid or password is invalid.',
  },
  forbiddenCredentials: {
    code: 403,
    message:
      'Your login has failed more than two times, you need to make login in Jira Website and pass manually of the security CAPTCHA.',
  },
  internalError: {
    code: 500,
    message: 'Request failed with status code 500',
  },
  invalidKitEntry: {
    code: 400,
    message: 'Please review the current svnkit data',
  },
  invalidDpmEntry: {
    code: 400,
    message: 'Please review the current dpm data',
  },
};

module.exports = (err, _req, res, _next) => {
  const error = errors[err] || errors[err.message];

  if (error) {
    console.log(error);
    return res.status(error.code).json({ message: error.message });
  } else {
    console.log(err);
    return res.status(500).json(err);
  }
};
