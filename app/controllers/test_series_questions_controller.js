import { LoggerFactory } from '../lib/logger.js';
import TestSeries, { TEST_SERIES_TYPES } from '../models/test_series.js';
import utils from '../lib/utils.js';
import models from '../models/index.js';
import redis from '../lib/redis.js';
import { Op } from 'sequelize';
import config from '../config/config.js';

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
      const latestTestSeries = await TestSeries.findOne({
        where: {
          type: TEST_SERIES_TYPES.WEEKLY,
        },
        order: [['updated_at', 'desc']],
      });

      if (!latestTestSeries) {
        return res.json({ data: { test_series: [] } });
      }

      let cacheKey = `test_series:weekly:${latestTestSeries.week_end_date}`;

      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json({ data: { test_series: JSON.parse(cachedData) } });
      }

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

      await redis.set(cacheKey, JSON.stringify(dataToSend));

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

      let cacheKey = `test_series:weekly:${unique_key}`;

      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        this.logger.info('returned cached data');

        return res.json({
          data: { week_tests: JSON.parse(cachedData) },
          message: 'fetched successfuly',
          status_code: 200,
          success: true,
        });
      }

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
        order: ['created_at'],
      });

      const dataToSend = testSeriesQuestions.map((q) => ({
        id: q.TestSeriesQuestion.id,
        meta: q.TestSeriesQuestion.meta,
        image: utils.getStaticImageUrlPath(q.raw_question_data.split('/')[1]),
      }));

      const BATCH_SIZE = 100;
      const batches = [];
      const intervals = Math.ceil(dataToSend.length / BATCH_SIZE);
      for (let i = 0; i < intervals; i++) {
        const startIndex = i * BATCH_SIZE;
        const endIndex = startIndex + BATCH_SIZE;
        const batch = dataToSend.slice(startIndex, endIndex);
        batches.push({
          id: `${unique_key}_${i + 1}`,
          questions: batch,
        });
      }

      await redis.set(
        cacheKey,
        JSON.stringify(batches),
        'EX',
        config.times.hours_24_in_s,
      );

      return res.json({
        data: { week_tests: batches },
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
