import { validationResult } from 'express-validator';
import { LoggerFactory } from '../lib/logger.js';
import UserTransactionService from '../services/user_transaction_service.js';
import createHttpError from 'http-errors';
import utils from '../lib/utils.js';
import { HttpStatusCode } from 'axios';
import { CREATION_SOURCE } from '../models/user_transaction.js';
import { createHash } from 'node:crypto';
import redis from '../lib/redis.js';
import config from '../config/config.js';

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

      const hash = createHash('md5')
        .update(JSON.stringify(req.query))
        .digest('hex');

      const cacheKey = `transactions:${user.id}:index:${hash}`;
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

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

      const responseData = { data: jsonData, meta: meta };

      await redis.set(
        cacheKey,
        JSON.stringify(responseData),
        'EX',
        config.times.hours_24_in_s,
      );

      return res.json(responseData);
    } catch (error) {
      this._logger.error('error in TransactionController index', { error });
      next(error);
    }
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  show = async (req, res, next) => {
    try {
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        throw createHttpError(HttpStatusCode.BadRequest, {
          errors: isBodyValid.array(),
        });
      }
      const user = req.user;

      const userTransaction = await this._userTransactionService.show({
        userId: user.id,
        id: req.params.id,
      });

      const jsonData = userTransaction?.toJSON() ?? null;

      const meta = utils.meta(req, jsonData ? 1 : 0);

      return res.json({ data: jsonData, meta: meta });
    } catch (error) {
      this._logger.error('error in TransactionController index', { error });
      next(error);
    }
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  create = async (req, res, next) => {
    try {
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        throw createHttpError(HttpStatusCode.BadRequest, {
          errors: isBodyValid.array(),
        });
      }
      const user = req.user;
      // TODO: ALSO NEED TO ADD SUBSCRIPTION MIDDLEWARE TO ADD SUBSCRIPTION INFO IN THE REQUEST
      // TODO: SUBSCRIPTION SERVICE/CONTROLLER/ROUTES/MODELS

      const { sub_cat_id, amount, transaction_datetime, recipient_name } =
        req.body;

      const dbMeta = {
        sub_cat_id,
        amount,
        transaction_datetime,
        recipient_name,
      };

      const newUserTransaction =
        await this._userTransactionService.createUserTransaction({
          user_id: user.id,
          amount,
          isIntAmount: true,
          sub_cat_id,
          transaction_datetime,
          creation_source: CREATION_SOURCE.app,
          recipient_name,
          meta: dbMeta,
        });

      const jsonData = newUserTransaction.toJSON();

      const meta = utils.meta(req, 1);
      meta.filters = {
        sub_cat_id,
        amount,
        transaction_datetime,
        recipient_name,
      };

      const cacheKeyPrefix = `transactions:${user.id}:`;
      await utils.deleteAllKeysWithPrefix(cacheKeyPrefix);

      return res
        .status(HttpStatusCode.Created)
        .json({ data: jsonData, meta: meta });
    } catch (error) {
      this._logger.error('error in TransactionController create', error);
      next(error);
    }
  };

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  update = async (req, res, next) => {
    try {
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        throw createHttpError(HttpStatusCode.BadRequest, {
          errors: isBodyValid.array(),
        });
      }
      const user = req.user;
      // TODO: ALSO NEED TO ADD SUBSCRIPTION MIDDLEWARE TO ADD SUBSCRIPTION INFO IN THE REQUEST
      // TODO: SUBSCRIPTION SERVICE/CONTROLLER/ROUTES/MODELS

      const { id } = req.params;

      const { sub_cat_id, amount, transaction_datetime, recipient_name } =
        req.body;

      const userTransaction = await this._userTransactionService.update(id, {
        user_id: user.id,
        amount,
        isIntAmount: true,
        sub_cat_id,
        transaction_datetime,
        recipient_name,
      });

      const jsonData = userTransaction.toJSON();

      const meta = utils.meta(req, 1);
      meta.filters = {
        sub_cat_id,
        amount,
        transaction_datetime,
        recipient_name,
      };

      const cacheKeyPrefix = `transactions:${user.id}:`;
      await utils.deleteAllKeysWithPrefix(cacheKeyPrefix);

      return res.status(HttpStatusCode.Ok).json({ data: jsonData, meta: meta });
    } catch (error) {
      this._logger.error('error in TransactionController create', error);
      next(error);
    }
  };

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  delete = async (req, res, next) => {
    try {
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        throw createHttpError(HttpStatusCode.BadRequest, {
          errors: isBodyValid.array(),
        });
      }
      const user = req.user;
      const { id } = req.params;

      const isDeleted = await this._userTransactionService.delete(id, user.id);

      const meta = utils.meta(req, 1);

      const cacheKeyPrefix = `transactions:${user.id}:`;
      await utils.deleteAllKeysWithPrefix(cacheKeyPrefix);

      return res.json({ data: { deleted_count: isDeleted }, meta: meta });
    } catch (error) {
      this._logger.error('error in TransactionController delete', error);
      next(error);
    }
  };
}

export default new TransactionController();
