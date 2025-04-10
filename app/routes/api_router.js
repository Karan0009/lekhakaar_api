import express from 'express';
import testSeriesQuestionsRouter from './test_series_questions_router.js';
import lekhakaarRouter from './lekhakaar_router.js';
import setPagination from '../middlewares/set_pagination.js';

const apiRouter = express.Router();

apiRouter.use('/test-series', testSeriesQuestionsRouter);
apiRouter.use('/lekhakaar', setPagination, lekhakaarRouter);

apiRouter.use((err, req, res, next) => {
  const message = err.message || 'Internal Server Error';
  const statusCode = err.statusCode || 500;
  const errors = err.errors || [];
  return res.status(statusCode).json({
    meta: { message, status_code: statusCode, success: false },
    errors,
  });
});

export default apiRouter;
