import jwt from '../lib/jwt.js';
import UserService from '../services/user_service.js';
import { HttpStatusCode } from 'axios';
import config from '../config/config.js';
import createHttpError from 'http-errors';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const setUser = async (req, res, next) => {
  try {
    if (
      (config.APP_ENV === 'development' || config.APP_ENV === 'testing') &&
      req.query.user_id
    ) {
      const user_id = req.query.user_id;
      const userService = new UserService();
      req.user = await userService.getUserById(user_id);
      return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        createHttpError(
          HttpStatusCode.Unauthorized,
          'Unauthorized: No token provided',
        ),
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = await jwt.verifyToken(token);

    //TODO: FIX TOKEN IS NOT EXPIRING

    if (!decoded || !decoded.user_id) {
      return next(
        createHttpError(
          HttpStatusCode.Unauthorized,
          'Unauthorized: Invalid token',
        ),
      );
    }

    const user = await userService.getUserById(decoded.user_id);
    if (!user) {
      return next(
        createHttpError(
          HttpStatusCode.Unauthorized,
          'Unauthorized: User not found',
        ),
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default setUser;
