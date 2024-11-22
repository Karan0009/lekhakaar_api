import { LoggerFactory } from '../lib/logger';

class TransactionController {
  constructor() {
    this.logger = new LoggerFactory('TransactionController').logger;
  }

  async addRawTransaction(req, res, next) {}
}

export default new TransactionController();
