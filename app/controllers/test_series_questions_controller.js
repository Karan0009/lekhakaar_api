import { LoggerFactory } from '../lib/logger.js';
import TestSeries, { TEST_SERIES_TYPES } from '../models/test_series.js';
import utils from '../lib/utils.js';
import models from '../models/index.js';

class TestSeriesQuestionsController {
  constructor() {
    this.logger = new LoggerFactory('TestSeriesQuestionsController').logger;
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getTotalWeeklyTestSeries = async (req, res, next) => {
    try {
      const weeklyTestSeries = await TestSeries.findAll({
        where: {
          type: TEST_SERIES_TYPES.WEEKLY,
        },
      });

      const dataToSend = weeklyTestSeries.map((t) => ({
        id: t.id,
        name: t.name,
        unique_key: t.unique_key,
        week_end_date: utils
          .getDayJsObj(t.week_end_date)
          .format('DD MMM, YYYY'),
        meta: t.meta,
      }));
      return res.json({ data: { test_series: dataToSend } });
    } catch (error) {
      this.logger.error('error in getWeeklyTestSeries', { error });
      next(error);
    }
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getTestSeriesQuestionsByTestSeriesUniqueKey = async (req, res, next) => {
    try {
      const { unique_key } = req.params;

      if (!unique_key) throw new Error('invalid unique_key');

      const testSeries = await TestSeries.findOne({
        where: {
          unique_key: unique_key,
        },
      });

      if (!testSeries) throw new Error('test series not found');

      const testSeriesQuestions = await models.TestSeriesRawQuestion.findAll({
        attributes: ['raw_question_data'],
        include: [
          {
            model: models.TestSeriesQuestion,
            where: {
              weekly_test_series_id: testSeries.id,
            },
          },
        ],
      });

      const dataToSend = testSeriesQuestions.map((q) => ({
        id: q.TestSeriesQuestion.id,
        meta: q.TestSeriesQuestion.meta,
        image: utils.getStaticImageUrlPath(q.raw_question_data.split('/')[1]),
      }));

      return res.json({
        data: { questions: dataToSend },
        message: 'fetched successfuly',
        status_code: 200,
        success: true,
      });
    } catch (error) {
      this.logger.error(
        'error in getTestSeriesQuestionsByTestSeriesUniqueKey',
        { error },
      );
      next(error);
    }
  };
}

export default new TestSeriesQuestionsController();
