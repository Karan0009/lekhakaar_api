import express from 'express';
import testSeriesQuestionsRouter from './test_series_questions_router.js';

const apiRouter = express.Router();

apiRouter.use('/test-series', testSeriesQuestionsRouter);

apiRouter.use((err, req, res, next) => {
  const message = err.message || 'Internal Server Error';
  const statusCode = err.status || 500;
  return res
    .status(500)
    .json({ message, success: false, status_code: statusCode });
});

export default apiRouter;
