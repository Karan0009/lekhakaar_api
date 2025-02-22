import jwt from '../lib/jwt.js';
import userService from '../services/user_service.js';
import { HttpStatusCode } from 'axios';
import config from '../config/config.js';

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
      req.user = await userService.getUserById(user_id);
      next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HttpStatusCode.Unauthorized).json({
        message: 'Unauthorized: No token provided',
        success: false,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await jwt.verifyToken(token);

    if (!decoded || !decoded.user_id) {
      return res.status(HttpStatusCode.Unauthorized).json({
        message: 'Unauthorized: Invalid token',
        success: false,
      });
    }

    const user = await userService.getUserById(decoded.user_id);
    if (!user) {
      return res.status(HttpStatusCode.Unauthorized).json({
        message: 'Unauthorized: User not found',
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in setUserMiddleware:', error);
    next(error);
  }
};

export default setUser;
