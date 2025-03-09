import { col, fn, literal, Op } from 'sequelize';
import { LoggerFactory } from '../lib/logger.js';
import utils from '../lib/utils.js';
import models from '../models/index.js';
import UserTransaction, {
  USER_TRANSACTION_STATUSES,
} from '../models/user_transaction.js';
import config from '../config/config.js';

export default class UserTransactionService {
  constructor() {
    this._logger = new LoggerFactory('UserTransactionService').logger;
  }

  /**
   * upsert yearly summary
   * @param {string} userId
   * @param {*} subCategoryId
   * @param {Date} createdAtOfTransaction
   * @param {'weekly' | 'monthly' | 'quarterly' | 'yearly'} summaryType
   * @param {*} sqlTransaction
   * @returns {Promise<MonthlySummarizedUserTransaction>}
   */
  async createUserTransaction(data, sqlTransaction = null) {
    this._logger.info('inserting user transaction');

    if (
      !data.user_id ||
      !data.amount ||
      !data.transaction_datetime ||
      !data.recipient_name ||
      !data.meta
    ) {
      this._logger.error('invalid data to create user transaction', { data });
      throw new Error('invalid data');
    }

    const newUserTransaction = await UserTransaction.create(
      {
        user_id: data.user_id,
        sub_cat_id: data.sub_cat_id || null,
        amount: utils.formatAmount(data.amount),
        transaction_datetime: data.transaction_datetime,
        recipient_name: data.recipient_name,
        meta: data.meta,
        status: USER_TRANSACTION_STATUSES.EXTRACTED,
      },
      {
        transaction: sqlTransaction,
      },
    );

    return newUserTransaction;
  }

  /**
   * upsert yearly summary
   * @param {string} userId
   * @param {'weekly' | 'monthly' | 'quarterly' | 'yearly'} summaryType
   * @param {*} sqlTransaction
   * @returns {Promise<any>}
   */
  async getSummarizedUserTransactionsByUserId(
    userId,
    summaryType,
    onDate,
    subCategoryId,
    options,
    sqlTransaction = null,
  ) {
    if (
      options.orderBy !== config.ORDER_BY.asc &&
      options.orderBy !== config.ORDER_BY.desc
    ) {
      throw new Error('Invalid sort order');
    }

    if (!['transaction_datetime', 'amount'].includes(options.sortBy)) {
      throw new Error('Invalid sort by column');
    }

    const dateObj = utils.getDayJsObj(new Date(onDate));
    if (!dateObj) {
      throw new Error('invalid onDate');
    }

    const { dateKey, durationType } = this._getSummaryMeta(summaryType);

    const whereObject = {
      user_id: userId,
    };

    if (onDate) {
      whereObject[Op.and] = [
        literal(
          `DATE_TRUNC('${durationType}', "transaction_datetime") = DATE_TRUNC('${durationType}', '${onDate}'::DATE)`,
        ),
      ];
    }

    let sortBy;
    if (options.sortBy === 'amount') {
      sortBy = 'total_amount';
    } else {
      sortBy = dateKey;
    }

    const attributes = [
      'user_id',
      [fn('SUM', col('amount')), 'total_amount'],
      [
        fn(
          'DATE',
          fn('DATE_TRUNC', `${durationType}`, col('transaction_datetime')),
        ),
        dateKey,
      ],
    ];

    const groupBy = ['"UserTransaction"."user_id"', dateKey];

    const includes = [];

    if (subCategoryId) {
      whereObject.sub_cat_id = subCategoryId;
      attributes.push('sub_cat_id');
      groupBy.push('sub_cat_id');
      includes.push([
        {
          model: models.SubCategory,
          attributes: ['id', 'name', 'description'],
        },
      ]);
    }

    const userTransactions = await models.UserTransaction.findAll({
      attributes: attributes,
      where: whereObject,
      include: includes,
      group: groupBy,
      order: [[sortBy, options.orderBy]],
      useMaster: true,
      transaction: sqlTransaction,
    });

    return userTransactions;
  }

  /**
   * upsert yearly summary
   * @param {string} userId
   * @param {string} fromDate
   * @param {string} toDate
   * @param {string} subCategoryId
   * @param {{limit:number,offset:number,orderBy:string,sortBy:string}} options
   * @param {*} sqlTransaction
   * @returns {Promise<any>}
   */
  async countAndGetTransactionsList(
    userId,
    fromDate,
    toDate,
    subCategoryId,
    options,
    sqlTransaction = null,
  ) {
    const fromDateObj = utils.getDayJsObj(new Date(fromDate));
    const toDateObj = utils.getDayJsObj(new Date(toDate));
    if (!fromDateObj || !toDateObj) {
      throw new Error('invalid date');
    }

    const whereObject = {
      user_id: userId,
    };
    whereObject[Op.and] = [
      literal(`DATE("transaction_datetime") >= DATE('${fromDate}')`),
      literal(`DATE("transaction_datetime") <= DATE('${toDate}')`),
    ];

    let sortBy;
    if (options.sortBy === 'amount') {
      sortBy = 'amount';
    } else if (options.sortBy === 'transaction_datetime') {
      sortBy = 'transaction_datetime';
    }

    const attributes = [
      'user_id',
      'amount',
      'sub_cat_id',
      'transaction_datetime',
    ];

    const includes = [
      {
        model: models.SubCategory,
        attributes: ['id', 'name', 'description'],
      },
    ];

    if (subCategoryId) {
      whereObject.sub_cat_id = subCategoryId;
    }

    const userTransactions = await models.UserTransaction.findAndCountAll({
      attributes: attributes,
      where: whereObject,
      include: includes,
      order: [[sortBy, options.orderBy]],
      limit: options.limit,
      offset: options.offset,
      useMaster: true,
      transaction: sqlTransaction,
    });

    return userTransactions;
  }

  /**
   * upsert yearly summary
   * @param {string} userId
   * @param {string} fromDate
   * @param {string} toDate
   * @param {string} subCategoryId
   * @param {{limit:number,offset:number,orderBy:string,sortBy:string}} options
   * @param {*} sqlTransaction
   * @returns {Promise<any>}
   */
  async getTransactionsList(
    userId,
    fromDate,
    toDate,
    subCategoryId,
    options,
    sqlTransaction = null,
  ) {
    const fromDateObj = utils.getDayJsObj(new Date(fromDate));
    const toDateObj = utils.getDayJsObj(new Date(toDate));
    if (!fromDateObj || !toDateObj) {
      throw new Error('invalid date');
    }

    const whereObject = {
      user_id: userId,
    };
    whereObject[Op.and] = [
      literal(`DATE("transaction_datetime") >= DATE('${fromDate}')`),
      literal(`DATE("transaction_datetime") <= DATE('${toDate}')`),
    ];

    let sortBy;
    if (options.sortBy === 'amount') {
      sortBy = 'amount';
    } else if (options.sortBy === 'transaction_datetime') {
      sortBy = 'transaction_datetime';
    }

    const attributes = [
      'user_id',
      'amount',
      'sub_category_id',
      'transaction_datetime',
    ];

    const includes = [
      {
        model: models.SubCategory,
        attributes: ['id', 'name', 'description'],
      },
    ];

    if (subCategoryId) {
      whereObject.sub_cat_id = subCategoryId;
    }

    const userTransactions = await models.UserTransaction.findAll({
      attributes: attributes,
      where: whereObject,
      include: includes,
      order: [[sortBy, options.orderBy]],
      useMaster: true,
      transaction: sqlTransaction,
    });

    return userTransactions;
  }

  /**
   * @param {'weekly' | 'monthly' | 'quarterly' | 'yearly'} summaryType
   */
  _getSummaryMeta(summaryType) {
    if (summaryType === 'daily') {
      return {
        durationType: 'day',
        dateKey: 'day_start',
      };
    } else if (summaryType === 'weekly') {
      return {
        durationType: 'week',
        dateKey: 'week_start',
      };
    } else if (summaryType === 'monthly') {
      return {
        durationType: 'month',
        dateKey: 'month_start',
      };
    } else if (summaryType === 'quarterly') {
      return {
        durationType: 'quarter',
        dateKey: 'quarter_start',
      };
    } else if (summaryType === 'yearly') {
      return {
        model: models.YearlySummarizedUserTransaction,
        durationType: 'year',
        tableName: 'yearly_summarized_user_transactions',
        dateKey: 'year_start',
      };
    } else {
      throw new Error('invalid summaryType');
    }
  }
}
