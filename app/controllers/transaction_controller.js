import { validationResult } from 'express-validator';
import { LoggerFactory } from '../lib/logger.js';
import { UserTransactionSerializer } from '../serializers/user_transaction_serializer.js';
import UserTransactionService from '../services/user_transaction_service.js';
import createHttpError from 'http-errors';
import utils from '../lib/utils.js';

class TransactionController {
  constructor() {
    this._logger = new LoggerFactory('TransactionController').logger;
    this._userTransactionService = new UserTransactionService();
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  index = async (req, res, next) => {
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
        from_date: fromDate,
        to_date: toDate,
        sub_cat_id: subCatId,
        limit,
        offset,
        page,
      } = req.query;

      const { count, rows } =
        await this._userTransactionService.countAndGetTransactionsList({
          userId: user.id,
          fromDate: fromDate,
          toDate: toDate,
          subCategoryId: subCatId,
          options: {
            limit,
            offset,
            orderBy,
            sortBy,
          },
        });

      // const serializedData = UserTransactionSerializer.serialize(
      //   rows.map((item) => item.toJSON()),
      // );

      // serializedData.meta = utils.metaData(count, limit, page);
      // serializedData.filters = {
      //   order_by: orderBy,
      //   sort_by: sortBy,
      //   on_date: onDate,
      // };

      const jsonData = rows.map((item) => item.toJSON());

      const meta = utils.metaData(count, limit, page);
      meta.filters = {
        order_by: orderBy,
        sort_by: sortBy,
        from_date: fromDate,
        to_date: toDate,
        sub_cat_id: subCatId,
      };

      return res.json({ data: jsonData, meta: meta });
    } catch (error) {
      this._logger.error('error in TransactionController index', { error });
      next(error);
    }
  };
}

export default new TransactionController();
