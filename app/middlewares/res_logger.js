import { LoggerFactory } from '../lib/logger.js';
/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */ const responseLogger = (req, res, next) => {
  res.addListener('finish', () => {
    const sHeaders = _secureHeaders(res.getHeaders());
    new LoggerFactory('SERVER RESPONSE').logger.info(
      `REQ_END :: method:${req.method} url: ${req.url}`,
      {
        headers: sHeaders,
        status: res.statusCode,
      },
    );
    next();
  });
  res.addListener('close', () => {
    const sHeaders = _secureHeaders(res.getHeaders());
    new LoggerFactory('SERVER RESPONSE').logger.info(
      `REQ_END :: method:${req.method} url: ${req.url}`,
      {
        headers: sHeaders,
        status: res.statusCode,
      },
    );
    next();
  });
  res.addListener('error', () => {
    const sHeaders = _secureHeaders(res.getHeaders());
    new LoggerFactory('SERVER RESPONSE').logger.error(
      `REQ_END :: method:${req.method} url: ${req.url}`,
      {
        headers: sHeaders,
        status: res.statusCode,
      },
    );
    next();
  });
};

const _secureHeaders = (headers) => {
  const secureHeaders = {
    'x-request-id': headers['x-request-id'],
    'user-agent': headers['user-agent'],
    'accept-encoding': headers['accept-encoding'],
    'content-length': headers['content-length'],
    'content-type': headers['content-type'],
    authorization: 'RETRACTED',
    'x-access-token': 'RETRACTED',
    'x-refresh-token': 'RETRACTED',
  };
  return secureHeaders;
};

export default responseLogger;
