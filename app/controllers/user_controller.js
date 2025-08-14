import { LoggerFactory } from '../lib/logger.js';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import utils from '../lib/utils.js';
import CategoryService from '../services/category_service.js';
import UserService from '../services/user_service.js';

export default class UserController {
  constructor() {
    this._logger = new LoggerFactory('UserController').logger;
    this._categoryService = new CategoryService();
    this._userService = new UserService();
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

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  update = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createHttpError(
          HttpStatusCode.BadRequest,
          utils.getValidationErrorMessage(errors),
        );
      }

      const user = req.user;
      const { name, occupation, city } = req.body;

      const dataToUpdate = {};
      if (name) dataToUpdate.name = name;
      if (occupation) dataToUpdate.occupation = occupation;
      if (city) dataToUpdate.city = city;

      const result = await this._userService.updateUser(user.id, {
        ...dataToUpdate,
      });

      return res.status(HttpStatusCode.Ok).json({
        data: dataToUpdate,
        meta: {
          success: true,
        },
      });
    } catch (error) {
      this._logger.error('error in update', error);
      next(error);
    }
  };
}
