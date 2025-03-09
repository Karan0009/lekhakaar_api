import jwt from '../lib/jwt.js';
import userService from '../services/user_service.js';
import { HttpStatusCode } from 'axios';
import config from '../config/config.js';
import createHttpError from 'http-errors';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const setPagination = async (req, _, next) => {
  try {
    let limit = parseInt(req.query.limit);
    let page = parseInt(req.query.page);
    let offset = (page - 1) * limit;
    req.query.limit = limit;
    req.query.offset = offset;
    req.query.page = page;
    next();
  } catch (error) {
    next(error);
  }
};

export default setPagination;
