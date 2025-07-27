import { validationResult } from 'express-validator';
import { LoggerFactory } from '../lib/logger.js';
import redis from '../lib/redis.js';
import config from '../config/config.js';
import otpService from '../services/otp_service.js';
import userService from '../services/user_service.js';
import utils from '../lib/utils.js';
import { sendOtpMessage } from '../../grpc_client/wa_grpc_client.js';
import { HttpStatusCode } from 'axios';
import refreshTokenService from '../services/refresh_token_service.js';
import jwt from '../lib/jwt.js';
import createHttpError from 'http-errors';

class AuthController {
  constructor() {
    this._logger = new LoggerFactory('AuthController').logger;
  }

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  sendOtp = async (req, res, next) => {
    try {
      const TESTING_PHONE_NUMBER = '1111111111';
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        return res.json({ errors: isBodyValid.array() });
      }
      const { phone_number } = req.body;

      const userOtpKey = `user_login_otp:${phone_number}`;
      const userOtpVerifyKey = `user_login_otp:verify:${phone_number}`;
      const otpExists = await redis.get(userOtpKey);

      if (otpExists) {
        // res.header("retry_after") = utils.getDayJsObj(otpExists).diff(utils.getDayJsObj(),"seconds");
        res.set(
          'Retry-After',
          utils.getDayJsObj(otpExists).diff(utils.getDayJsObj(), 'seconds'),
        );
        return res.status(HttpStatusCode.TooManyRequests).json({
          message: 'OTP already sent. Try again later.',
          data: null,
          status: HttpStatusCode.TooManyRequests,
          success: false,
        });
      }

      // TODO: BAD CODE for testing phone number at all places! ;(
      const { newOtp, otpCode } =
        phone_number === TESTING_PHONE_NUMBER
          ? await otpService.generateDummyOtp(config.times.mins_15_in_s)
          : await otpService.generateOtp(6, config.times.mins_15_in_s);

      await redis.setex(
        userOtpVerifyKey,
        config.times.mins_15_in_s,
        JSON.stringify(newOtp.toJSON()),
      );

      const retryAfter = utils
        .getDayJsObj()
        .add(config.times.mins_2_in_s, 'seconds')
        .toISOString();
      await redis.setex(userOtpKey, config.times.mins_2_in_s, retryAfter);

      const requestPayload = {
        data: {
          service_name: config.APP_NAME,
          phone_number: `91${phone_number}`,
          otp_code: otpCode,
        },
      };

      if (
        config.APP_ENV !== 'testing' ||
        phone_number !== TESTING_PHONE_NUMBER
      ) {
        const waClientGrpcSendOtpRes = await sendOtpMessage(requestPayload);
        if (!waClientGrpcSendOtpRes.success) {
          this._logger.error('failed to send otp', { waClientGrpcSendOtpRes });
        } else {
          this._logger.info('otp sent successfully');
        }
      }

      res.set('Retry-After', retryAfter);
      return res.status(HttpStatusCode.Ok).json({
        message: 'otp sent successfully',
        data: {
          otp_code: newOtp.id,
          phone_number: phone_number,
          retry_after: config.times.mins_2_in_s,
          valid_till: config.times.mins_15_in_s,
        },
        success: true,
      });
    } catch (error) {
      this._logger.error('error in getOtp controller', { error });
      next(error);
    }
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  verifyOtp = async (req, res, next) => {
    try {
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        return res.status(HttpStatusCode.BadRequest).json({
          data: null,
          success: false,
          message: 'invalid params',
          errors: isBodyValid.array(),
        });
      }
      const { phone_number, code, otp } = req.body;

      const isOtpValid = await otpService.verifyOtp(code, otp, phone_number);

      if (!isOtpValid) {
        return res.status(HttpStatusCode.Unauthorized).json({
          message: 'invalid otp',
          data: null,
          success: false,
        });
      }

      /** @type import('../models/user.js').default */
      let user;
      user = await userService.getUserByPhoneNumber(phone_number);

      if (!user) {
        user = await userService.createUser({
          phone_number,
          country_code: '+91',
        });
      }

      const deviceFingerprint = utils.getDeviceFingerprint(req);
      const newRefreshToken = await refreshTokenService.generateToken(
        user.id,
        deviceFingerprint,
      );
      const newAccessToken = await jwt.generateToken(
        { user_id: user.id },
        '15m',
      );

      return res.status(HttpStatusCode.Created).json({
        message: 'OTP verified successfully',
        success: true,
        data: {
          refresh_token: newRefreshToken,
          access_token: newAccessToken,
          access_token_expires_in: '15m',
        },
      });
    } catch (error) {
      this._logger.error('error in verifyOtp controller', { error });
      next(error);
    }
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  generateAccessToken = async (req, res, next) => {
    try {
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        return res.status(HttpStatusCode.BadRequest).json({
          data: null,
          success: false,
          message: 'invalid params',
          errors: isBodyValid.array(),
        });
      }
      const { refresh_token } = req.body;

      const { isValid, refreshToken } = await refreshTokenService.validateToken(
        refresh_token,
      );
      if (!isValid) {
        return res.status(HttpStatusCode.Unauthorized).json({
          message: 'invalid token',
          data: null,
          success: false,
        });
      }

      const newAccessToken = await jwt.generateToken(
        { user_id: refreshToken.user_id },
        '15m',
      );

      return res.status(HttpStatusCode.Created).json({
        message: 'access_token created',
        success: true,
        data: {
          access_token: newAccessToken,
          expires_in: '15m',
        },
      });
    } catch (error) {
      this._logger.error('error in verifyOtp controller', { error });
      next(error);
    }
  };

  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  logout = async (req, res, next) => {
    try {
      const isBodyValid = validationResult(req);
      if (!isBodyValid.isEmpty()) {
        throw createHttpError(HttpStatusCode.BadRequest, 'invalid params');
        // return res.status(HttpStatusCode.BadRequest).json({
        //   data: null,
        //   success: false,
        //   message: 'invalid params',
        //   errors: isBodyValid.array(),
        // });
      }
      const { refresh_token, logout_type } = req.body;

      const { isValid, refreshToken } = await refreshTokenService.validateToken(
        refresh_token,
      );

      if (!isValid) {
        return res.status(HttpStatusCode.Unauthorized).json({
          message: 'invalid token',
          data: null,
          success: false,
        });
      }

      const allTokens = (
        await refreshTokenService.getAllTokensForUser(refreshToken.user_id)
      ).map((t) => t.token);

      let tokensToBeRevoked = [];
      switch (logout_type) {
        case config.LOGOUT_TYPES.self:
          tokensToBeRevoked = allTokens.filter((t) => t === refresh_token);
          break;
        case config.LOGOUT_TYPES.all:
          tokensToBeRevoked = allTokens;
          break;
        case config.LOGOUT_TYPES.all_others:
        default:
          tokensToBeRevoked = allTokens.filter((t) => t !== refresh_token);
          break;
      }

      if (tokensToBeRevoked.length > 0) {
        await refreshTokenService.removeGivenTokensForUser(
          refreshToken.user_id,
          tokensToBeRevoked,
        );
      }

      return res.status(HttpStatusCode.Ok).json({
        message: 'logged out successfully',
        success: true,
        data: null,
      });
    } catch (error) {
      this._logger.error('error in verifyOtp controller', { error });
      next(error);
    }
  };
}

export default new AuthController();
