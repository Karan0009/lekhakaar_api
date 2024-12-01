import config from '../../config/config.js';
import BaseJob from '../base/base_job.js';

export default class TestSeriesQuestionsJob extends BaseJob {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.testSeriesQuestionsQueue,
      jobOptions: {},
    });
  }
}
