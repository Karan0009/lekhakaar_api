import { LoggerFactory } from '../lib/logger.js';
/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */ const requestLogger = (req, res, next) => {
  const sHeaders = _secureHeaders(req.headers);
  new LoggerFactory('CLIENT REQUEST').logger.info(
    `REQ_START :: method:${req.method} url: ${req.url}`,
    {
      headers: sHeaders,
      body: req.body,
    },
  );
  next();
};

const _secureHeaders = (headers) => {
  const secureHeaders = {
    'x-request-id': headers['x-request-id'],
    'user-agent': headers['user-agent'],
    'accept-encoding': headers['accept-encoding'],
    'content-length': headers['content-length'],
    'content-type': headers['content-type'],
    authorization: 'RETRACTED',
  };
  return secureHeaders;
};

export default requestLogger;
