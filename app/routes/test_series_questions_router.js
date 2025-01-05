import express from 'express';
import testSeriesQuestionsController from '../controllers/test_series_questions_controller.js';

const testSeriesQuestionsRouter = express.Router();

testSeriesQuestionsRouter.get(
  '/weekly-tests',
  testSeriesQuestionsController.getTotalWeeklyTestSeries,
);

testSeriesQuestionsRouter.get(
  '/weekly-tests/submit-list',
  testSeriesQuestionsController.getLastFiveSubmittedTestSeries,
);

testSeriesQuestionsRouter.get(
  '/weekly-tests/:unique_key',
  testSeriesQuestionsController.getTestSeriesQuestionsByTestSeriesUniqueKey,
);

testSeriesQuestionsRouter.get(
  '/weekly-tests/download/:unique_key',
  testSeriesQuestionsController.downloadOneTestSeriesPdfBySetId,
);

testSeriesQuestionsRouter.get(
  '/weekly-tests/submit-count/:unique_key',
  testSeriesQuestionsController.getSubmittedTestSeriesCount,
);

testSeriesQuestionsRouter.post(
  '/weekly-tests/submit/:unique_key',
  testSeriesQuestionsController.submitTestSeries,
);

export default testSeriesQuestionsRouter;
