import config from '../../config/config.js';
import BaseWorker from '../base/base_worker.js';
import TestSeriesQuestionsJob from '../jobs/test_series_questions_job.js';

export default class TestSeriesQuestionsProcessor extends BaseWorker {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.testSeriesQuestionsQueue,
      workerOptions: {
        name: config.BULL_MQ_QUEUES.testSeriesQuestionsQueue,
        concurrency: 1,
      },
    });
  }

  /**
   *
   * @param {Job} job
   */
  async jobProcessor(job) {
    await new TestSeriesQuestionsJob().process();
    // this.logger.info(
    //   `this ran starting processing job of ${job.name} with #${job.id}`,
    // );
  }
}
