import express from 'express';
import authController from '../controllers/auth_controller.js';
import { body } from 'express-validator';

const authRouter = express.Router();

authRouter.post(
  '/otp',
  body('phone_number').isNumeric({ no_symbols: true }),
  body('are_terms_accepted').isIn(['Y']).trim().notEmpty(),
  authController.sendOtp,
);
authRouter.post(
  '/otp/verify',
  body('phone_number').isNumeric({ no_symbols: true }),
  body('code').isString().trim().notEmpty(),
  body('otp').isString().notEmpty().isLength({ max: 6, min: 6 }),
  authController.verifyOtp,
);

authRouter.post(
  '/token',
  body('refresh_token').trim().notEmpty(),
  authController.generateAccessToken,
);

authRouter.post(
  '/logout',
  body('refresh_token').trim().notEmpty(),
  body('logout_type')
    .optional()
    .isString()
    .isIn(['all', 'all_others', 'slef'])
    .withMessage(
      `Invalid logout_type. Allowed values: 'all', 'all_others', 'self'`,
    ),
  authController.logout,
);

export default authRouter;
