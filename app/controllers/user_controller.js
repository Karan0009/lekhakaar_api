import { LoggerFactory } from '../lib/logger.js';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import utils from '../lib/utils.js';
import CategoryService from '../services/category_service.js';

export default class UserController {
  constructor() {
    this._logger = new LoggerFactory('UserController').logger;
    this._categoryService = new CategoryService();
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  show = async (req, res, next) => {
    try {
      const user = req.user;

      const modifiedData = {
        ...user.toJSON(),
      };

      delete modifiedData.id;
      delete modifiedData.updated_at;
      delete modifiedData.status;

      return res
        .status(HttpStatusCode.Ok)
        .json({ data: modifiedData, meta: {} });
    } catch (error) {
      this._logger.error('error in index', error);
      next(error);
    }
  };
}
