import config from '../../config/config.js';
import BaseWorker from '../base/base_worker.js';
import TestSeriesQuestionsBatchesJob from '../jobs/test_series_questions_batches_job.js';

export default class TestSeriesQuestionsBatchesProcessor extends BaseWorker {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.testSeriesQuestionsBatchesQueue,
      workerOptions: {
        name: config.BULL_MQ_QUEUES.testSeriesQuestionsBatchesQueue,
        concurrency: 1,
        removeOnComplete: {
          age: config.times.mins_30_in_s,
        },
      },
    });
  }

  /**
   *
   * @param {Job} job
   */
  async jobProcessor(job) {
    await new TestSeriesQuestionsBatchesJob().process();
  }
}
