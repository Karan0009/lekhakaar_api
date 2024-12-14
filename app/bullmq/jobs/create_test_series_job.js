import config from '../../config/config.js';
import BaseJob from '../base/base_job.js';

import sequelize from '../../lib/sequelize.js';
import { col, fn, Op, Transaction, where } from 'sequelize';
import TestSeriesQuestion from '../../models/test_series_question.js';
import TestSeries, { TEST_SERIES_TYPES } from '../../models/test_series.js';
import dayjs from 'dayjs';
import utils from '../../lib/utils.js';
const __dirname = import.meta.dirname;

export default class CreateTestSeriesJob extends BaseJob {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.createTestSeriesQueue,
      jobOptions: {
        repeat: {
          pattern: '59 23 * * *', // everyday at 11:59
        },
      },
    });
  }

  async process(jobData) {
    try {
      this.logger.info('job ran', { jobData });
      await this.createPendingWeeklyTestSeries();
      //   await this.addQuestionsToWeeklyTestSeries();
    } catch (error) {
      this.logger.error('error in process', { error });
      throw error;
    }
  }

  async addQuestionsToWeeklyTestSeries() {
    try {
      const weeklyTestSeriesList = await TestSeries.findAll({
        where: {
          type: TEST_SERIES_TYPES.WEEKLY,
        },
        order: [['week_end_date', 'ASC']],
      });

      for (let i = 0; i < weeklyTestSeriesList.length; ++i) {
        const weeklyTestSeries = weeklyTestSeriesList[i];
        const testSeriesQuestions = await TestSeriesQuestion.update(
          {
            weekly_test_series_id: weeklyTestSeries.id,
          },
          {
            where: {
              [Op.and]: [
                where(
                  fn('date', col('question_added_date')),
                  '<=',
                  fn('date', weeklyTestSeries.week_end_date),
                ),
                { weekly_test_series_id: { [Op.is]: null } },
              ],
            },
          },
        );

        // for (let j = 0; j < testSeriesQuestions.length; ++j) {
        //     await TestSeriesQuestion.update({
        //         weekly_test_series_id: weeklyTestSeries.id,
        //     },{
        //         where
        //     })
        //   await testSeriesQuestions[j].update({

        //   };
        // }

        console.log(testSeriesQuestions);
      }
    } catch (err) {
      throw err;
    }
  }

  async createPendingWeeklyTestSeries() {
    try {
      const totalQuestionsDatesCount = await TestSeriesQuestion.findAll({
        attributes: [fn('distinct', fn('date', col('question_added_date')))],
      });
      const latestDateOfNullWeeklySeriesIdTestSeriesQuestion =
        await TestSeriesQuestion.findOne({
          where: {
            weekly_test_series_id: { [Op.is]: null },
          },
          order: [['question_added_date', 'ASC']],
        });

      const weekEndDateOfTestSeriesQuestion = utils.getDayJsObj(
        latestDateOfNullWeeklySeriesIdTestSeriesQuestion.question_added_date,
      );

      const dayOfWeekEndDateOfTestSeriesQuestion =
        weekEndDateOfTestSeriesQuestion.day();

      const weekEndDate = weekEndDateOfTestSeriesQuestion.add(
        7 - dayOfWeekEndDateOfTestSeriesQuestion,
        'days',
      );
      const week_end_date_str = weekEndDate.toISOString();

      const existingTestSeries = await TestSeries.findOne({
        where: {
          [Op.and]: [
            where(
              fn('date', col('week_end_date')),
              fn('date', week_end_date_str),
            ),
          ],
        },
      });

      if (!existingTestSeries) {
        const lastWeeklyTestSeries = await TestSeries.findOne({
          where: {
            type: TEST_SERIES_TYPES.WEEKLY,
          },
          order: [['week_end_date', 'DESC']],
        });
        if (!lastWeeklyTestSeries) return;
        const test = {
          name: `Week ${parseInt(lastWeeklyTestSeries.id) + 1} Test Series`,
          unique_key: `week_${parseInt(lastWeeklyTestSeries.id) + 1}`,
          type: TEST_SERIES_TYPES.WEEKLY,
          week_end_date: week_end_date_str,
        };
        await TestSeries.create(test);
      }

      await this.addQuestionsToWeeklyTestSeries();
      // const lastWeekEndDate = await TestSeries.findOne({
      //   attributes: ['week_end_date'],
      //   where: {
      //     week_end_date: { [Op.not]: null },
      //   },
      //   order: [['week_end_date', 'DESC']],
      // });

      //   if (!lastWeekEndDate || !lastWeekEndDate?.week_end_date) {

      //   }

      //   const totalWeeklyTestsCount = Math.ceil(
      //     totalQuestionsDatesCount.length / 7,
      //   );

      //   const weeklyTests = [];
      //   for (let index = 0; index < totalWeeklyTestsCount; ++index) {
      //     const test = {
      //       name: `Week ${index + 1} Test Series`,
      //       unique_key: `week_${index + 1}`,
      //       type: TEST_SERIES_TYPES.WEEKLY,
      //     };
      //     weeklyTests.push(test);
      //   }

      //   await TestSeries.bulkCreate(weeklyTests, {
      //     ignoreDuplicates: true,
      //     conflictAttributes: ['unique_key'],
      //   });
    } catch (error) {
      throw error;
    }
  }
}
