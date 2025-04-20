import { Op } from 'sequelize';
import { LoggerFactory } from '../lib/logger.js';
import SubCategory from '../models/sub_category.js';

export default class SubCategoryService {
  constructor() {
    this._logger = new LoggerFactory('SubCategoryService').logger;
  }

  /**
   * Count and Get all SubCategory created by user and created by system
   * @param {*} data
   */
  async countAndGetAllSubCategories({ userId, sqlTransaction = null }) {
    try {
      const subCategories = await SubCategory.scope('active').findAndCountAll({
        attributes: [
          'id',
          'category_id',
          'user_id',
          'name',
          'description',
          'icon',
        ],
        where: {
          [Op.or]: [{ user_id: userId }, { user_id: { [Op.is]: null } }],
        },
        transaction: sqlTransaction,
      });

      return subCategories;
    } catch (error) {
      this._logger.error('error in getAllSubCategories', error);
    }
  }
}
