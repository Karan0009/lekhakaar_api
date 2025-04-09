import { LoggerFactory } from '../lib/logger.js';
import TransactionSummaryService from '../services/transaction_summary_service.js';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import UserTransactionService from '../services/user_transaction_service.js';

import { SummarizedUserTransactionsSerializer } from '../serializers/summarized_user_transactions_serializer.js';
import utils from '../lib/utils.js';

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
        summary_type: summaryType,
        on_date: onDate,
        sub_cat_id: subCatId,
      } = req.query;

      const summaries =
        await this._userTransactionService.getSummarizedUserTransactionsByUserId(
          {
            summaryType: summaryType,
            userId: user.id,
            onDate: onDate,
            subCatId: subCatId,
            options: {
              orderBy,
              sortBy,
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
      };

      return res.json({ data: summariesList, meta });
    } catch (error) {
      this._logger.error('error in getSummary', { error });
      next(error);
    }
  };
}

export default new TransactionSummaryController();
