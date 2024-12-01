import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import config from '../config/config.js';
import { LoggerFactory } from '../lib/logger.js';
import TestSeriesQuestionsJob from './jobs/test_series_questions_job.js';
import { ExpressAdapter } from '@bull-board/express';

class BullUIController {
  constructor() {
    this.logger = new LoggerFactory('BullUIController').logger;
  }

  /**
   *
   * @returns {ExpressAdapter} serverAdapter
   */
  getBullBoardServerAdapter() {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(config.BULL_UI_PATH);

    createBullBoard({
      queues: [new BullMQAdapter(new TestSeriesQuestionsJob().queue)],
      serverAdapter: serverAdapter,
    });

    return serverAdapter;
  }
}

export default new BullUIController();
