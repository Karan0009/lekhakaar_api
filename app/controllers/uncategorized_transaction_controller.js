import { LoggerFactory } from '../lib/logger.js';
import UncategorizedTransactionService from '../services/uncategorized_transaction_service.js';
import UncategorizedTransactionSerializer from '../serializers/uncategorized_transaction_serializer.js';
import config from '../config/config.js';
import utils from '../lib/utils.js';

class UncategorizedTransactionController {
  constructor() {
    this._logger = new LoggerFactory(
      'UncategorizedTransactionController',
    ).logger;
    this._uncategorizedTransactionService =
      new UncategorizedTransactionService();
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getUncategorizedTransactions = async (req, res, next) => {
    try {
      const user = req.user;

      const {
        page,
        limit,
        offset,
        order_by: orderBy,
        sort_by: sortBy,
      } = req.query;

      const { count, rows } =
        await this._uncategorizedTransactionService.countAndGetUncategorizedTransactionByUserId(
          user.id,
          {
            limit,
            offset,
            orderBy: orderBy || config.ORDER_BY.desc,
            sortBy: sortBy || 'created_at',
          },
        );

      const serializedData = UncategorizedTransactionSerializer.serialize(rows);

      serializedData.meta = utils.metaData(count, limit, page);
      serializedData.filters = { orderBy: orderBy, sortBy: sortBy };

      return res.json(serializedData);
    } catch (error) {
      this._logger.error('error in getUnCategorizedTransactions', { error });
      next(error);
    }
  };
}

export default new UncategorizedTransactionController();
