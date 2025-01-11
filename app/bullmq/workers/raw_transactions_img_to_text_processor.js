import config from '../../config/config.js';
import BaseWorker from '../base/base_worker.js';
import RawTransactionsImgToTextJob from '../jobs/raw_transactions_img_to_text_job.js';

export default class RawTransactionsImgToTextProcessor extends BaseWorker {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.rawTransactionsImgToTextQueue,
      workerOptions: {
        name: config.BULL_MQ_QUEUES.rawTransactionsImgToTextQueue,
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
    await new RawTransactionsImgToTextJob().process();
  }
}
