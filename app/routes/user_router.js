import express from 'express';
import UserController from '../controllers/user_controller.js';
import { body } from 'express-validator';

const userRouter = express.Router();
const userController = new UserController();

userRouter.get('/details', userController.show);
userRouter.put(
  '/details',
  body('name')
    .optional()
    .isString()
    .trim()
    .toLowerCase()
    .isLength({ min: 1, max: 100 }),
  body('occupation')
    .optional()
    .isString()
    .trim()
    .toLowerCase()
    .isLength({ min: 2, max: 100 }),
  body('city')
    .optional()
    .isString()
    .trim()
    .toLowerCase()
    .isLength({ min: 2, max: 100 }),
  userController.update,
);

export default userRouter;
