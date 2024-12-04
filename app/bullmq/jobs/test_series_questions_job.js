import config from '../../config/config.js';
import BaseJob from '../base/base_job.js';
import openai from '../../lib/openai.js';

export default class TestSeriesQuestionsJob extends BaseJob {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.testSeriesQuestionsQueue,
      jobOptions: {
        repeat: {
          pattern: '*/2 * * * *',
        },
      },
    });
  }

  async process(jobData) {
    try {
      this.logger.info('job ran', { jobData });
    } catch (error) {
      this.logger.error('error in process', { error });
      throw error;
    }
  }
}
