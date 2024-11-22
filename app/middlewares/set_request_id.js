import { getNamespace } from 'cls-hooked';
import { v1 as uuidv1 } from 'uuid';

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
    next();
  });
};

export default setRequestId;
