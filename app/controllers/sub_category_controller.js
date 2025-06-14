import { HttpStatusCode } from 'axios';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { LoggerFactory } from '../lib/logger.js';
import redis from '../lib/redis.js';
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
      const cacheKey = `sub_categories:${req.user.id}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        this._logger.info('Cache hit for sub categories', { cacheKey });
        const cachedResponse = JSON.parse(cachedData);

        return res.status(HttpStatusCode.Ok).json(cachedResponse);
      }

      this._logger.info('Cache miss for sub categories', { cacheKey });
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

      const responseData = {
        data: subCategoriesList,
        meta,
      };
      // Cache the response for 24 hours
      await redis.set(
        cacheKey,
        JSON.stringify(responseData),
        'EX',
        86400, // 24 hours in seconds
      );

      return res.status(HttpStatusCode.Ok).json(responseData);
    } catch (error) {
      this._logger.error('error in index', { error });
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

      const { name, description, icon, category_id: categoryId } = req.body;

      const isExisting =
        await this._subCategoryService.getSubCategoryByNameAndUserId(
          name,
          user.id,
        );

      if (isExisting) {
        throw createHttpError(HttpStatusCode.BadRequest, {
          errors: ['SubCategory already exists'],
        });
      }

      const newSubCatgory = await this._subCategoryService.createSubCategory({
        name,
        description,
        icon,
        categoryId: categoryId,
        userId: user.id,
        sqlTransaction: null,
      });

      const meta = utils.metaData(1, 1, 1);
      meta.filters = {};

      // Invalidate the cache for sub categories
      const cacheKey = `sub_categories:${user.id}`;
      await redis.del(cacheKey);

      return res
        .status(HttpStatusCode.Created)
        .json({ data: newSubCatgory.toJSON(), meta });
    } catch (error) {
      this._logger.error('error in index', { error });
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

      const result = await this._subCategoryService.countAndGetAllSubCategories(
        {
          searchTxt: searchTxt,
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
