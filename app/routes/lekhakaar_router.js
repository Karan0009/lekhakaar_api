import express from 'express';
import authRouter from './auth_router.js';
import setUser from '../middlewares/set_user.js';
import userTransactionsRouter from './user_transaction_router.js';
import subCategoryRouter from './sub_category_router.js';
import categoryRouter from './category_router.js';
import rawTransactionsRouter from './raw_transaction_router.js';
import userRouter from './user_router.js';

const lekhakaarRouter = express.Router();

lekhakaarRouter.use('/v1/auth', authRouter);

lekhakaarRouter.use('/v1/transaction', setUser, userTransactionsRouter);
lekhakaarRouter.use('/v1/sub-category', setUser, subCategoryRouter);
lekhakaarRouter.use('/v1/category', setUser, categoryRouter);
lekhakaarRouter.use('/v1/raw-transaction', setUser, rawTransactionsRouter);
lekhakaarRouter.use('/v1/user', setUser, userRouter);

export default lekhakaarRouter;
