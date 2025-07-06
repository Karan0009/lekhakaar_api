import express from 'express';
import UserController from '../controllers/user_controller.js';

const userRouter = express.Router();
const userController = new UserController();

userRouter.get('/details', userController.show);

export default userRouter;
