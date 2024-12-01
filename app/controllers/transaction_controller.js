import { LoggerFactory } from '../lib/logger.js';

class TransactionController {
  constructor() {
    this.logger = new LoggerFactory('TransactionController').logger;
  }
}

export default new TransactionController();
