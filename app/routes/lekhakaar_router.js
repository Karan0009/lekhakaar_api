import express from 'express';
import authRouter from './auth_router.js';

const lekhakaarRouter = express.Router();

lekhakaarRouter.use('/v1/auth', authRouter);

export default lekhakaarRouter;
