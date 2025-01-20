import config from '../../config/config.js';
import BaseWorker from '../base/base_worker.js';
import RawTransactionsDataJob from '../jobs/raw_transactions_data_job.js';

export default class RawTransactionsDataProcessor extends BaseWorker {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.rawTransactionsDataQueue,
      workerOptions: {
        name: config.BULL_MQ_QUEUES.rawTransactionsDataQueue,
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
    await new RawTransactionsDataJob().process();
  }
}
