import config from '../config/config.js';
import { LoggerFactory } from '../lib/logger.js';
import UncategorizedTransaction from '../models/uncategorized_transactions.js';
import UserTransaction from '../models/user_transaction.js';

export default class UncategorizedTransactionService {
  constructor() {
    this._logger = new LoggerFactory('UncategorizedTransactionService').logger;
  }

  /**
   *
   * @param {*} transactionId
   * @param {*} userId
   * @param {*} sqlTransaction
   * @returns {Promise<UncategorizedTransaction>}
   */
  async create(transactionId, userId, sqlTransaction = null) {
    this._logger.info(
      `Adding uncategorized transaction for user: ${userId}, transaction ID: ${transactionId}`,
    );
    return UncategorizedTransaction.create(
      {
        transaction_id: transactionId,
        user_id: userId,
      },
      { transaction: sqlTransaction },
    );
  }

  /**
   *
   * @param {*} userId
   * @param {{limit:number,offset:number,orderBy:string,sortBy:string}} options
   * @returns {Promise<UncategorizedTransaction[]>}
   */
  async getUncategorizedTransactionByUserId(userId, options) {
    if (
      options.orderBy !== config.ORDER_BY.asc &&
      options.orderBy !== config.ORDER_BY.desc
    ) {
      throw new Error('Invalid sort order');
    }

    if (options.sortBy !== 'created_at') {
      throw new Error('Invalid sort by column');
    }

    return UncategorizedTransaction.findAll({
      where: { user_id: userId },
      limit: options.limit,
      offset: options.offset,
      order: [[options.sortBy, options.orderBy]],
    });
  }

  /**
   *
   * @param {*} userId
   * @param {{limit:number,offset:number,orderBy:string,sortBy:string}} options
   * @returns {Promise<{count:number,rows:UncategorizedTransaction[]}>}
   */
  async countAndGetUncategorizedTransactionByUserId(userId, options) {
    if (
      options.orderBy !== config.ORDER_BY.asc &&
      options.orderBy !== config.ORDER_BY.desc
    ) {
      throw new Error('Invalid sort order');
    }

    if (options.sortBy !== 'created_at') {
      throw new Error('Invalid sort by column');
    }

    return UncategorizedTransaction.findAndCountAll({
      where: { user_id: userId },
      include: [{ model: UserTransaction, required: true }],
      limit: options.limit,
      offset: options.offset,
      order: [[options.sortBy, options.orderBy]],
    });
  }

  /**
   * This method can be added to delete an uncategorized transaction by its ID.
   * @param {*} transactionId
   * @returns {Promise<boolean>}
   */
  async deleteTransactionById(transactionId) {
    this._logger.info(
      `Deleting uncategorized transaction ID: ${transactionId}`,
    );
    const result = await UncategorizedTransaction.destroy({
      where: { transaction_id: transactionId },
    });
    return result > 0;
  }
}
