import { LoggerFactory } from '../lib/logger.js';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import utils from '../lib/utils.js';
import CategoryService from '../services/category_service.js';

export default class CategoryController {
  constructor() {
    this._logger = new LoggerFactory('CategoryController').logger;
    this._categoryService = new CategoryService();
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

      const {
        // order_by: orderBy,
        // sort_by: sortBy,
        search_txt: searchTxt,
        limit,
        offset,
        page,
      } = req.query;

      const result = await this._categoryService.countAndGetAll({
        searchTxt: null,
        options: {
          limit,
          offset,
          // orderBy,
          // sortBy,
        },
        sqlTransaction: null,
      });

      const categoriesList = result.rows.map((item) => item.toJSON());

      const meta = utils.metaData(result.count, limit, page);
      meta.filters = {
        // order_by: orderBy,
        // sort_by: sortBy,
      };

      return res.status(HttpStatusCode.Ok).json({ data: categoriesList, meta });
    } catch (error) {
      this._logger.error('error in index', error);
      next(error);
    }
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  search = async (req, res, next) => {
    try {
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        throw createHttpError(HttpStatusCode.BadRequest, {
          errors: isBodyValid.array(),
        });
      }
      const user = req.user;

      const {
        // order_by: orderBy,
        // sort_by: sortBy,
        search_txt: searchTxt,
        limit,
        offset,
        page,
      } = req.query;

      const result = await this._categoryService.countAndGetAll({
        searchTxt: searchTxt,
        options: {
          limit,
          offset,
          // orderBy,
          // sortBy,
        },
        sqlTransaction: null,
      });

      const categoriesList = result.rows.map((item) => item.toJSON());

      const meta = utils.metaData(result.count, limit, page);
      meta.filters = {
        // order_by: orderBy,
        // sort_by: sortBy,
      };

      return res.status(HttpStatusCode.Ok).json({ data: categoriesList, meta });
    } catch (error) {
      this._logger.error('error in search', error);
      next(error);
    }
  };
}
