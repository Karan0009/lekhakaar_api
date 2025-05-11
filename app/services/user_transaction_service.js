import { col, fn, literal, Op } from 'sequelize';
import { LoggerFactory } from '../lib/logger.js';
import utils from '../lib/utils.js';
import models from '../models/index.js';
import UserTransaction, {
  CREATION_SOURCE,
  USER_TRANSACTION_STATUSES,
} from '../models/user_transaction.js';
import config from '../config/config.js';
import SubCategory from '../models/sub_category.js';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';

export default class UserTransactionService {
  constructor() {
    this._logger = new LoggerFactory('UserTransactionService').logger;
  }

  /**
   * create user transaction
   * @param {*} data
   * @param {*} sqlTransaction
   * @returns {Promise<UserTransaction>}
   */
  async createUserTransaction(data, sqlTransaction = null) {
    this._logger.info('inserting user transaction');

    let {
      user_id,
      amount,
      isIntAmount,
      transaction_datetime,
      recipient_name,
      creation_source,
      sub_cat_id,
      meta,
    } = data;

    if (!transaction_datetime) {
      transaction_datetime = utils.getDayJsObj(new Date()).toISOString();
    } else {
      transaction_datetime = utils
        .getDayJsObj(transaction_datetime)
        .toISOString();
    }

    if (!sub_cat_id) {
      const uncategorizedSubCategory = await SubCategory.findOne({
        attributes: ['id'],
        where: {
          name: config.UNCATEGORIZED_SUB_CAT_NAME,
          user_id: { [Op.is]: null },
        },
        transaction: sqlTransaction,
      });

      if (!uncategorizedSubCategory) {
        throw new createHttpError(HttpStatusCode.InternalServerError, {
          errors: 'cannot create uncategorized transaction',
        });
      }
      sub_cat_id = uncategorizedSubCategory.id;
    } else {
      const subCat = await SubCategory.findOne({
        attributes: ['id'],
        where: {
          id: sub_cat_id,
          [Op.or]: [{ user_id }, { user_id: { [Op.is]: null } }],
        },
        transaction: sqlTransaction,
      });

      if (!subCat) {
        throw new createHttpError(HttpStatusCode.InternalServerError, {
          errors: 'cannot find sub_category',
        });
      }
      sub_cat_id = subCat.id;
    }

    if (!recipient_name) {
      recipient_name = 'the anti-savings fund';
    }

    if (
      !user_id ||
      !amount ||
      !creation_source ||
      !Object.values(CREATION_SOURCE).includes(creation_source) ||
      !meta
    ) {
      this._logger.error('invalid data to create user transaction', data);
      throw new createHttpError(HttpStatusCode.BadRequest, {
        errors: 'invalid data',
      });
    }

    const newUserTransaction = await UserTransaction.create(
      {
        user_id: user_id,
        sub_cat_id: sub_cat_id,
        amount: utils.formatAmount(amount, isIntAmount),
        transaction_datetime: transaction_datetime,
        recipient_name: recipient_name.toLowerCase(),
        creation_source: creation_source,
        meta: meta,
        status: USER_TRANSACTION_STATUSES.EXTRACTED,
      },
      {
        transaction: sqlTransaction,
      },
    );

    return newUserTransaction;
  }

  /**
   * update user transaction
   * @param {*} id
   * @param {*} data
   * @param {*} sqlTransaction
   * @returns {Promise<UserTransaction>}
   */
  async update(id, data, sqlTransaction = null) {
    this._logger.info('updating user transaction');

    const userTransaction = await UserTransaction.findByPk(id, {
      attributes: [
        'id',
        'amount',
        'recipient_name',
        'transaction_datetime',
        'sub_cat_id',
        'user_id',
      ],
    });

    if (!userTransaction) {
      throw new createHttpError(HttpStatusCode.BadRequest, {
        errors: 'transaction not found',
      });
    }

    let {
      user_id,
      amount,
      isIntAmount,
      transaction_datetime,
      recipient_name,
      sub_cat_id,
    } = data;

    if (userTransaction.user_id !== user_id) {
      throw new createHttpError(HttpStatusCode.Unauthorized, {
        errors: 'unauthorized to update transaction',
      });
    }

    if (transaction_datetime) {
      transaction_datetime = utils
        .getDayJsObj(transaction_datetime)
        .toISOString();
    }

    if (sub_cat_id) {
      const subCat = await SubCategory.findOne({
        attributes: ['id'],
        where: {
          id: sub_cat_id,
          [Op.or]: [{ user_id }, { user_id: { [Op.is]: null } }],
        },
        transaction: sqlTransaction,
      });

      if (!subCat) {
        throw new createHttpError(HttpStatusCode.InternalServerError, {
          errors: 'cannot find sub_category',
        });
      }
      sub_cat_id = subCat.id;
    }

    const updatedData = {};

    if (sub_cat_id) {
      updatedData.sub_cat_id = sub_cat_id;
    }

    if (amount) {
      updatedData.amount = utils.formatAmount(amount, isIntAmount);
    }

    if (transaction_datetime) {
      updatedData.transaction_datetime = transaction_datetime;
    }

    if (recipient_name) {
      updatedData.recipient_name = recipient_name.toLowerCase();
    }

    if (Object.keys(updatedData).length > 0) {
      await userTransaction.update(updatedData, {
        transaction: sqlTransaction,
      });
    }

    return userTransaction;
  }

  /**
   *
   * @param {{
   *  userId: string,
   *  summaryType: string,
   *  onDate: string,
   *  subCatId: string,
   *  options: { orderBy: string, sortBy: string },
   *  sqlTransaction: any }} data
   * @returns {Promise<any[]>}
   */
  async getSummarizedUserTransactionsByUserId({
    userId,
    summaryType,
    onDate,
    fromDate,
    toDate,
    subCatId,
    options,
    sqlTransaction = null,
  }) {
    if (
      options.orderBy !== config.ORDER_BY.asc &&
      options.orderBy !== config.ORDER_BY.desc
    ) {
      throw new Error('Invalid sort order');
    }

    if (!['transaction_datetime', 'amount'].includes(options.sortBy)) {
      throw new Error('Invalid sort by column');
    }

    const { durationType } = this._getSummaryMeta(summaryType);
    const DATE_SUMMARY_START_LABEL = 'summary_start';

    const whereObject = {
      user_id: userId,
    };

    if (onDate) {
      const onDateObj = utils.getDayJsObj(new Date(onDate));
      if (!onDateObj) {
        throw new Error('invalid on_date');
      }
      whereObject[Op.and] = [
        literal(
          `DATE_TRUNC('${durationType}', "transaction_datetime") = DATE_TRUNC('${durationType}', '${onDate}'::DATE)`,
        ),
      ];
    }

    if (fromDate && toDate) {
      const fromDateObj = utils.getDayJsObj(new Date(fromDate));
      if (!fromDateObj) {
        throw new Error('invalid from_date');
      }

      const toDateObj = utils.getDayJsObj(new Date(toDate));
      if (!toDateObj) {
        throw new Error('invalid to_date');
      }

      whereObject[Op.and] = [
        literal(
          `DATE_TRUNC('${durationType}', "transaction_datetime") BETWEEN DATE_TRUNC('${durationType}', '${fromDate}'::DATE) AND DATE_TRUNC('${durationType}', '${toDate}'::DATE)`,
        ),
      ];
    }

    let sortBy;
    if (options.sortBy === 'amount') {
      sortBy = 'total_amount';
    } else {
      sortBy = DATE_SUMMARY_START_LABEL;
    }

    const attributes = [
      'user_id',
      [fn('SUM', col('amount')), 'total_amount'],
      [
        fn(
          'DATE',
          fn('DATE_TRUNC', `${durationType}`, col('transaction_datetime')),
        ),
        DATE_SUMMARY_START_LABEL,
      ],
      'sub_cat_id',
    ];

    const groupBy = [
      '"UserTransaction"."user_id"',
      'UserTransaction.sub_cat_id',
      'sub_category.id',
      DATE_SUMMARY_START_LABEL,
    ];
    const includes = [];
    includes.push({
      model: SubCategory,
      required: true,
      as: 'sub_category',
      attributes: ['id', 'name', 'icon', 'description'],
    });

    if (subCatId != undefined && subCatId != null) {
      whereObject.sub_cat_id = subCatId;
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
   *
   * @param {{
   * userId: string,
   * fromDate: string,
   * toDate: string,
   * subCategoryId: string|number,
   * options, options: { orderBy: string, sortBy: string },
   * sqlTransaction: any
   * }} data
   * @returns {Promise<{rows: UserTransaction[],count: number,}>} user_transactions count and list
   */
  async countAndGetTransactionsList({
    userId,
    fromDate,
    toDate,
    subCategoryId,
    options,
    sqlTransaction = null,
  }) {
    const whereObject = {
      user_id: userId,
    };

    if (fromDate && toDate) {
      const fromDateObj = utils.getDayJsObj(new Date(fromDate));
      const toDateObj = utils.getDayJsObj(new Date(toDate));
      if (!fromDateObj || !toDateObj) {
        throw new Error('invalid date');
      }
      whereObject[Op.and] = [
        literal(`DATE("transaction_datetime") >= DATE('${fromDate}')`),
        literal(`DATE("transaction_datetime") <= DATE('${toDate}')`),
      ];
    }

    let sortBy;
    if (options.sortBy === 'amount') {
      sortBy = 'amount';
    } else if (options.sortBy === 'transaction_datetime') {
      sortBy = 'transaction_datetime';
    }

    const attributes = [
      'user_id',
      'amount',
      'recipient_name',
      'sub_cat_id',
      'transaction_datetime',
    ];

    const includes = [
      {
        model: SubCategory,
        attributes: ['id', 'name', 'description', 'icon'],
        as: 'sub_category',
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

  async delete(id, userId, sqlTransaction = null) {
    const userTrxn = await UserTransaction.findByPk(id);

    if (!userTrxn) {
      throw new createHttpError(HttpStatusCode.BadRequest, {
        errors: 'transaction not found',
      });
    }

    if (userTrxn.user_id !== userId) {
      throw new createHttpError(HttpStatusCode.Unauthorized, {
        errors: 'this is not your transaction',
      });
    }
    // todo: set status to deleted when destroying?
    return UserTransaction.destroy({
      where: { id: id, user_id: userId },
      transaction: sqlTransaction,
    });
  }
}
