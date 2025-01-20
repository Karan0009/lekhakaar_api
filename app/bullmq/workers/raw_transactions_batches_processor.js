import config from '../../config/config.js';
import BaseWorker from '../base/base_worker.js';
import RawTransactionsBatchesJob from '../jobs/raw_transactions_batches_job.js';

export default class RawTransactionsBatchesProcessor extends BaseWorker {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.rawTransactionsBatchesQueue,
      workerOptions: {
        name: config.BULL_MQ_QUEUES.rawTransactionsBatchesQueue,
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
    await new RawTransactionsBatchesJob().process();
  }
}
