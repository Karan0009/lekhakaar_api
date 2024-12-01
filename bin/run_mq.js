import TestSeriesQuestionsProcessor from '../app/bullmq/workers/test_series_questions_processor.js';
import { LoggerFactory } from '../app/lib/logger.js';

const logger = new LoggerFactory('expense-manager-bull-mq').logger;

async function run() {
  await new TestSeriesQuestionsProcessor().setupWorker();
}

(async () => {
  try {
    await run();
    logger.info('bullmq started');
  } catch (error) {
    logger.error('error in running bulmq processors', { error });
  }
})();
