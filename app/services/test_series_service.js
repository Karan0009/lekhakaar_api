import { Transaction } from 'sequelize';
import { LoggerFactory } from '../lib/logger.js';
import TestSeriesRawQuestion, {
  TEST_SERIES_RAW_QUESTION_STATUSES,
} from '../models/test_series_raw_question.js';

class TestSeriesService {
  constructor() {
    this.logger = new LoggerFactory('TestSeriesService').logger;
  }

  /**
   *
   * @param {string} userId
   */
  async getPendingTestSeriesRawQuestions(transacation = null) {
    return TestSeriesRawQuestion.findAll(
      {
        status: TEST_SERIES_RAW_QUESTION_STATUSES.PENDING,
      },
      transacation,
    );
  }

  /**
   *
   * @param {*} data
   * @param {Transaction} transacation
   * @returns
   */
  async addRawQuestion(data, transaction = null) {
    try {
      const newRawQuestion = await TestSeriesRawQuestion.create(data, {
        transaction,
      });

      return newRawQuestion;
    } catch (error) {
      this.logger.error('error in addRawQuestion', { error });
      throw error;
    }
  }
}

export default new TestSeriesService();
