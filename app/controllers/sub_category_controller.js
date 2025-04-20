import { LoggerFactory } from '../lib/logger.js';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import utils from '../lib/utils.js';
import SubCategoryService from '../services/sub_category_service.js';

class SubCategoryController {
  constructor() {
    this._logger = new LoggerFactory('SubCategoryController').logger;
    this._subCategoryService = new SubCategoryService();
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
        limit,
        offset,
        page,
      } = req.query;

      const result = await this._subCategoryService.countAndGetAllSubCategories(
        {
          userId: user.id,
          options: {
            limit,
            offset,
            // orderBy,
            // sortBy,
          },
          sqlTransaction: null,
        },
      );

      const subCategoriesList = result.rows.map((item) => item.toJSON());

      const meta = utils.metaData(result.count, limit, page);
      meta.filters = {
        // order_by: orderBy,
        // sort_by: sortBy,
      };

      return res
        .status(HttpStatusCode.Ok)
        .json({ data: subCategoriesList, meta });
    } catch (error) {
      this._logger.error('error in index', { error });
      next(error);
    }
  };
}

export default SubCategoryController;
