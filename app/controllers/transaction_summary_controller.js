import { LoggerFactory } from '../lib/logger.js';
import TransactionSummaryService from '../services/transaction_summary_service.js';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import UserTransactionService from '../services/user_transaction_service.js';
import utils from '../lib/utils.js';
import { createHash } from 'node:crypto';
import redis from '../lib/redis.js';
import config from '../config/config.js';

class TransactionSummaryController {
  constructor() {
    this._logger = new LoggerFactory('TransactionSummaryController').logger;
    this._transactionSummaryService = new TransactionSummaryService();
    this._userTransactionService = new UserTransactionService();
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  getSummary = async (req, res, next) => {
    try {
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        throw createHttpError(HttpStatusCode.BadRequest, {
          errors: isBodyValid.array(),
        });
      }
      const user = req.user;

      // TODO: CHECK ALLOWED FILTERS BASED ON USER TYPE (MAYBE FOR SUBSCRIPTION)
      // TODO: ALSO NEED TO ADD SUBSCRIPTION MIDDLEWARE TO ADD SUBSCRIPTION INFO IN THE REQUEST
      // TODO: SUBSCRIPTION SERVICE/CONTROLLER/ROUTES/MODELS

      const {
        order_by: orderBy,
        sort_by: sortBy,
        group_by: groupBy,
        summary_type: summaryType,
        on_date: onDate,
        from_date: fromDate,
        to_date: toDate,
        sub_cat_id: subCatId,
      } = req.query;

      const hash = createHash('md5')
        .update(JSON.stringify(req.query))
        .digest('hex');

      const cacheKey = `transactions:${user.id}:summary:${hash}`;
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const summaries =
        await this._userTransactionService.getSummarizedUserTransactionsByUserId(
          {
            summaryType: summaryType,
            userId: user.id,
            onDate: onDate,
            fromDate: fromDate,
            toDate: toDate,
            subCatId: subCatId,
            options: {
              orderBy,
              sortBy,
              groupBy,
            },
            sqlTransaction: null,
          },
        );

      // TODO: SEND SERIALIZED DATA SOMEDAY!
      // const serializedData = SummarizedUserTransactionsSerializer.serialize(
      //   summaries.map((item) => item.toJSON()),
      // );
      // serializedData.meta = utils.meta(req, 0);

      // serializedData.meta.filters = {
      //   order_by: orderBy,
      //   sort_by: sortBy,
      //   on_date: onDate,
      // };
      const summariesList = summaries.map((item) => item.toJSON());

      const meta = utils.meta(req, summariesList.length);
      meta.filters = {
        order_by: orderBy,
        sort_by: sortBy,
        on_date: onDate,
        summary_type: summaryType,
        sub_cat_id: subCatId,
      };

      const responseData = { data: summariesList, meta };

      await redis.set(
        cacheKey,
        JSON.stringify(responseData),
        'EX',
        config.times.hours_24_in_s,
      );

      return res.json(responseData);
    } catch (error) {
      this._logger.error('error in getSummary', { error });
      next(error);
    }
  };
}

export default new TransactionSummaryController();
