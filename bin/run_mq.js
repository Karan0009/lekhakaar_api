import cronChecker from '../app/bullmq/cron_checker.js';
import TestSeriesQuestionsProcessor from '../app/bullmq/workers/test_series_questions_processor.js';
import { LoggerFactory } from '../app/lib/logger.js';
import config from '../app/config/config.js';
import TestSeriesQuestionsBatchesProcessor from '../app/bullmq/workers/test_series_questions_batches_processor.js';
import RawTransactionsImgToTextProcessor from '../app/bullmq/workers/raw_transactions_img_to_text_processor.js';
import TestSeriesQuestionsJob from '../app/bullmq/jobs/test_series_questions_job.js';
import TestSeriesQuestionsBatchesJob from '../app/bullmq/jobs/test_series_questions_batches_job.js';
import RawTransactionsDataProcessor from '../app/bullmq/workers/raw_transactions_data_processor.js';
import RawTransactionsDataJob from '../app/bullmq/jobs/raw_transactions_data_job.js';
import RawTransactionsImgToTextJob from '../app/bullmq/jobs/raw_transactions_img_to_text_job.js';
import RawTransactionsBatchesProcessor from '../app/bullmq/workers/raw_transactions_batches_processor.js';
import RawTransactionsBatchesJob from '../app/bullmq/jobs/raw_transactions_batches_job.js';

const logger = new LoggerFactory('expense-manager-bull-mq').logger;

async function run() {
  await new TestSeriesQuestionsProcessor().setupWorker();
  await new TestSeriesQuestionsBatchesProcessor().setupWorker();
  await new RawTransactionsImgToTextProcessor().setupWorker();
  await new RawTransactionsDataProcessor().setupWorker();
  await new RawTransactionsBatchesProcessor().setupWorker();

  const jobInstances = [
    new TestSeriesQuestionsJob(),
    new TestSeriesQuestionsBatchesJob(),
    new RawTransactionsImgToTextJob(),
    new RawTransactionsDataJob(),
    new RawTransactionsBatchesJob(),
  ];
  await cronChecker.startCronChecker(config.times.mins_30_in_ms, jobInstances);
}

(async () => {
  try {
    await run();
    logger.info('bullmq started');
  } catch (error) {
    logger.error('error in running bulmq processors', { error });
  }
})();
