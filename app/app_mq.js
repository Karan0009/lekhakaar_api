import TestSeriesQuestionsProcessor from './bullmq/workers/test_series_questions_processor';

async function run() {
  await new TestSeriesQuestionsProcessor().setupWorker();
}

(async () => {
  await run();
})();
