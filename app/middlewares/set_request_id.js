import { getNamespace } from 'cls-hooked';
import { v1 as uuidv1 } from 'uuid';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const setRequestId = (req, res, next) => {
  req.requestId = uuidv1();
  const reqContext = getNamespace(`${process.env.APP_NAME}-req-context`);
  reqContext.run(() => {
    const value = req.user
      ? {
          user: req.user,
          request_id: req.requestId,
          url: req.path,
        }
      : { request_id: req.requestId, url: req.path };
    reqContext.set('req-context', value);
    res.setHeader('x-request-id', req.requestId);
    next();
  });
};

export default setRequestId;
