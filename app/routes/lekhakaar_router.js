import express from 'express';
import authRouter from './auth_router.js';
import setUser from '../middlewares/set_user.js';
import uncategorizedTransactionRouter from './uncategorized_transaction_router.js';
import userTransactionsRouter from './user_transaction_router.js';

const lekhakaarRouter = express.Router();

lekhakaarRouter.use('/v1/auth', authRouter);
lekhakaarRouter.use(
  '/v1/uncategorized-transaction',
  setUser,
  uncategorizedTransactionRouter,
);

lekhakaarRouter.use('/v1/transaction', setUser, userTransactionsRouter);

export default lekhakaarRouter;
