import express from 'express';
import testSeriesQuestionsRouter from './test_series_questions_router.js';

const apiRouter = express.Router();

apiRouter.use('/test-series', testSeriesQuestionsRouter);

apiRouter.use((err, req, res, next) => {
  return res.status(500).json({ message: 'Internal Server Error' });
});

export default apiRouter;
