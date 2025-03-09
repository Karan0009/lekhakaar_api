import config from '../config/config.js';
import { LoggerFactory } from '../lib/logger.js';
import utils from '../lib/utils.js';
import MonthlySummarizedUserTransaction from '../models/monthly_summarized_user_transaction.js';
import QuarterlySummarizedUserTransaction from '../models/quarterly_summarized_user_transaction.js';
import SubCategory from '../models/sub_category.js';
import WeeklySummarizedUserTransaction from '../models/weekly_summarized_user_transaction.js';
import YearlySummarizedUserTransaction from '../models/yearly_summarized_user_transaction.js';

export default class TransactionSummaryService {
  constructor() {
    this._logger = new LoggerFactory('TransactionSummaryService').logger;
  }

  /**
   * upsert yearly summary
   * @param {any[]} summarizedTransactions
   * @param {'weekly' | 'monthly' | 'quarterly' | 'yearly'} summaryType
   * @param {*} sqlTransaction
   * @returns {Promise<any>}
   */
  async bulkUpsertUserTransactionSummary(
    summarizedTransactions,
    summaryType,
    sqlTransaction = null,
  ) {
    const { dateKey, dateMethod, model } = this._getSummaryMeta(summaryType);

    const dataToUpsert = [];

    for (let i = 0; i < summarizedTransactions.length; ++i) {
      const dataObj = {
        user_id: summarizedTransactions[i].user_id,
        sub_category_id: summarizedTransactions[i].sub_cat_id,
        amount: summarizedTransactions[i].total_amount,
        updated_at: new Date(),
      };
      dataObj[dateKey] = `${dateMethod(
        utils.getDayJsObj(new Date(summarizedTransactions[i][dateKey])),
      )}`;

      dataToUpsert.push(dataObj);
    }

    return model.bulkCreate(dataToUpsert, {
      conflictAttributes: ['user_id', 'sub_category_id', dateKey],
      updateOnDuplicate: ['amount', 'updated_at'],
      transaction: sqlTransaction,
    });
  }

  /**
   * upsert yearly summary
   * @param {string} userId
   * @param {*} subCategoryId
   * @param {Date} summaryDateStart
   * @param {'weekly' | 'monthly' | 'quarterly' | 'yearly'} summaryType
   * @param {*} sqlTransaction
   * @returns {Promise<any>}
   */
  async upsertUserTransactionSummary(
    userId,
    subCategoryId,
    summaryDateStart,
    amount,
    summaryType,
    sqlTransaction = null,
  ) {
    this._logger.info(
      `upserting ${summaryType} summary: ${userId},${subCategoryId},${summaryDateStart}`,
    );
    const { dateKey, dateMethod, model } = this._getSummaryMeta(summaryType);

    const dataObj = {
      user_id: userId,
      sub_category_id: subCategoryId,
      amount,
      updated_at: new Date(),
    };
    dataObj[dateKey] = `${dateMethod(summaryDateStart)}`;

    return model.bulkCreate([dataObj], {
      conflictAttributes: ['user_id', 'sub_category_id', dateKey],
      updateOnDuplicate: ['amount', 'updated_at'],
      transaction: sqlTransaction,
    });
  }

  /**
   * @param {*} userId
   * @param {*} onDate
   * @param {*} subCategoryId
   * @param {'weekly' | 'monthly' | 'quarterly' | 'yearly'} summaryType
   * @param {{limit:number,offset:number,orderBy:string,sortBy:string}} options
   * @returns {Promise<YearlySummarizedUserTransaction[]>}
   */
  async getUserTransactionSummary(
    userId,
    onDate,
    subCategoryId,
    summaryType,
    options,
  ) {
    if (
      options.orderBy !== config.ORDER_BY.asc &&
      options.orderBy !== config.ORDER_BY.desc
    ) {
      throw new Error('Invalid sort order');
    }

    if (!['created_at', 'amount'].includes(options.sortBy)) {
      throw new Error('Invalid sort by column');
    }

    const dateObj = utils.getDayJsObj(onDate);
    if (!dateObj) {
      throw new Error('invalid onDate');
    }

    const { dateKey, dateMethod, model } = this._getSummaryMeta(summaryType);

    const whereObj = {
      user_id: userId,
    };

    whereObj[dateKey] = dateMethod(dateObj);

    if (subCategoryId !== null && subCategoryId !== undefined) {
      whereObj.sub_category_id = subCategoryId;
    }

    return model.findAll({
      where: whereObj,
      include: [{ model: SubCategory, required: true }],
      // limit: options.limit,
      // offset: options.offset,
      order: [[options.sortBy, options.orderBy]],
    });
  }

  /**
   * @param {'weekly' | 'monthly' | 'quarterly' | 'yearly'} summaryType
   */
  _getSummaryMeta(summaryType) {
    if (summaryType === 'weekly') {
      return {
        model: WeeklySummarizedUserTransaction,
        durationType: 'week',
        tableName: 'weekly_summarized_user_transactions',
        dateKey: 'week_start',
        dateMethod: utils.getWeekStartDate,
      };
    } else if (summaryType === 'monthly') {
      return {
        model: MonthlySummarizedUserTransaction,
        durationType: 'month',
        tableName: 'monthly_summarized_user_transactions',
        dateKey: 'month_start',
        dateMethod: utils.getMonthStartDate,
      };
    } else if (summaryType === 'quarterly') {
      return {
        model: QuarterlySummarizedUserTransaction,
        durationType: 'quarter',
        tableName: 'quarterly_summarized_user_transactions',
        dateKey: 'quarter_start',
        dateMethod: utils.getQuarterStartDate,
      };
    } else if (summaryType === 'yearly') {
      return {
        model: YearlySummarizedUserTransaction,
        durationType: 'year',
        tableName: 'yearly_summarized_user_transactions',
        dateKey: 'year_start',
        dateMethod: utils.getYearStartDate,
      };
    } else {
      throw new Error('invalid summaryType');
    }
  }
}
