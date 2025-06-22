import { validationResult } from 'express-validator';
import { LoggerFactory } from '../lib/logger.js';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import {
  RAW_TRANSACTION_STATUSES,
  RAW_TRANSACTION_TYPE,
} from '../models/raw_transaction.js';
import RawTransactionService from '../services/raw_transaction_service.js';

class RawTransactionController {
  constructor() {
    this._logger = new LoggerFactory('RawTransactionController').logger;
    this._rawTransactionService = new RawTransactionService();
  }

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

      let { type, data } = req.body;

      let rowStatus = RAW_TRANSACTION_STATUSES.PENDING;
      if (type === RAW_TRANSACTION_TYPE.WA_IMAGE) {
        rowStatus = RAW_TRANSACTION_STATUSES.PENDING_TEXT_EXTRACTION;
      }

      if (type === RAW_TRANSACTION_TYPE.WA_IMAGE) {
        const keyword = 'uploads/';
        const keywordIndex = req.file.path.indexOf(keyword);

        if (keywordIndex < 0) {
          throw new Error('invalid keywordIndex');
        }

        data = req.file.path.substring(keywordIndex);
      }

      const newRawTrxn = await this._rawTransactionService.addRawTransaction({
        user_id: user.id,
        raw_transaction_type: type,
        raw_transaction_data: data,
        status: rowStatus,
      });

      const jsonData = newRawTrxn.toJSON();

      return res
        .status(HttpStatusCode.Created)
        .json({ data: jsonData, meta: {} });
    } catch (error) {
      this._logger.error('error in create', error);
      next(error);
    }
  };
}

export default RawTransactionController;
