import express from 'express';
import { oneOf, query } from 'express-validator';
import config from '../config/config.js';
import transactionSummaryController from '../controllers/transaction_summary_controller.js';
import sortOrderValidator from '../middlewares/sort_order_validator.js';
import transactionController from '../controllers/transaction_controller.js';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';

const userTransactionsRouter = express.Router();

userTransactionsRouter.get(
  '/',
  query('sub_cat_id').isNumeric().optional(),
  query('on_date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .exists()
    .notEmpty()
    .escape(),
  ...sortOrderValidator(
    ['amount', 'transaction_datetime'],
    'transaction_datetime',
    config.ORDER_BY.desc,
  ),
  transactionController.index,
);

userTransactionsRouter.get(
  '/summary',
  query('summary_type').isIn(Object.values(config.SUMMARY_TYPE)).escape(),
  query('sub_cat_id').isNumeric().optional(),
  oneOf(
    [
      query('on_date')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .exists()
        .notEmpty()
        .escape(),
      [
        query('from_date')
          .matches(/^\d{4}-\d{2}-\d{2}$/)
          .exists()
          .notEmpty()
          .escape(),
        query('to_date')
          .matches(/^\d{4}-\d{2}-\d{2}$/)
          .exists()
          .notEmpty()
          .escape(),
      ],
    ],
    {
      errorType: 'flat',
      message: 'Either on_date or from_date and to_date must be provided',
    },
  ),
  (req, _, next) => {
    try {
      const {
        on_date: onDate,
        from_date: fromDate,
        to_date: toDate,
      } = req.query;
      if (onDate && (fromDate || toDate)) {
        throw createHttpError(HttpStatusCode.BadRequest, {
          errors: 'Either on_date or from_date and to_date must be provided',
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  },
  ...sortOrderValidator(
    ['amount', 'transaction_datetime'],
    'transaction_datetime',
    config.ORDER_BY.desc,
  ),
  transactionSummaryController.getSummary,
);

export default userTransactionsRouter;
