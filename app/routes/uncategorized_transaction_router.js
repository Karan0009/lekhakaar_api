import express from 'express';
import uncategorizedTransactionController from '../controllers/uncategorized_transaction_controller.js';

const uncategorizedTransactionRouter = express.Router();

uncategorizedTransactionRouter.get(
  '/',
  uncategorizedTransactionController.getUncategorizedTransactions,
);

export default uncategorizedTransactionRouter;
