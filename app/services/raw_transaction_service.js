import { Transaction } from 'sequelize';
import { LoggerFactory } from '../lib/logger.js';
import RawTransaction, {
  RAW_TRANSACTION_STATUSES,
} from '../models/raw_transaction.js';

class RawTransactionService {
  constructor() {
    this.logger = new LoggerFactory('RawTransactionService').logger;
  }

  /**
   *
   * @param {string} userId
   */
  async getPendingRawTransactionsByUserId(userId, transacation = null) {
    return RawTransaction.findAll(
      {
        user_id: userId,
        status: RAW_TRANSACTION_STATUSES.PENDING,
      },
      transacation,
    );
  }

  /**
   *
   * @param {*} data
   * @param {Transaction} transacation
   * @returns
   */
  async addRawTransaction(data, transaction = null) {
    try {
      const newRawTransaction = await RawTransaction.create(data, {
        transaction,
      });

      return newRawTransaction;
    } catch (error) {
      this.logger.error('error in addRawTransaction', { error });
      throw error;
    }
  }
}

export default RawTransactionService;
