import express from 'express';
import testSeriesQuestionsController from '../controllers/test_series_questions_controller.js';

const testSeriesQuestionsRouter = express.Router();

testSeriesQuestionsRouter.get(
  '/weekly-tests',
  testSeriesQuestionsController.getTotalWeeklyTestSeries,
);

testSeriesQuestionsRouter.get(
  '/weekly-tests/:unique_key',
  testSeriesQuestionsController.getTestSeriesQuestionsByTestSeriesUniqueKey,
);

export default testSeriesQuestionsRouter;
