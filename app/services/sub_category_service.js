import { Op } from 'sequelize';
import { LoggerFactory } from '../lib/logger.js';
import SubCategory, { SUB_CATEGORY_STATUSES } from '../models/sub_category.js';

export default class SubCategoryService {
  constructor() {
    this._logger = new LoggerFactory('SubCategoryService').logger;
  }

  /**
   * Count and Get all SubCategory created by user and created by system
   * @param {{
   *    userId: string,
   *    searchTxt: string,
   *    sqlTransaction: any
   * }} data
   */
  async countAndGetAllSubCategories({
    userId,
    searchTxt,
    sqlTransaction = null,
  }) {
    try {
      const whereObj = {
        [Op.or]: [{ user_id: userId }, { user_id: { [Op.is]: null } }],
      };

      if (searchTxt) {
        whereObj['name'] = { [Op.like]: `${searchTxt}%` };
      }
      const subCategories = await SubCategory.scope('active').findAndCountAll({
        attributes: [
          'id',
          'category_id',
          'user_id',
          'name',
          'description',
          'icon',
        ],
        where: whereObj,
        transaction: sqlTransaction,
      });

      return subCategories;
    } catch (error) {
      this._logger.error('error in getAllSubCategories', error);
      throw error;
    }
  }

  /**
   * @param {{
   *    userId: string,
   *    name: string,
   *    description: string,
   *    icon: string,
   *    categoryId: string|number
   *    sqlTransaction: any
   * }} data
   */
  async createSubCategory({
    userId,
    name,
    categoryId,
    description,
    icon,
    sqlTransaction = null,
  }) {
    try {
      const subCategory = await SubCategory.create(
        {
          name: name,
          description: description,
          icon: icon,
          user_id: userId,
          category_id: categoryId,
          status: SUB_CATEGORY_STATUSES.active,
        },
        {
          transaction: sqlTransaction,
        },
      );

      return subCategory;
    } catch (error) {
      this._logger.error('error in createSubCategory', error);
      throw error;
    }
  }

  /**
   *
   * @param {string} name
   * @param {string} userId
   * @param {*} sqlTransaction
   */
  async getSubCategoryByNameAndUserId(name, userId, sqlTransaction = null) {
    try {
      const subCategory = await SubCategory.findOne({
        where: {
          name: name,
          [Op.or]: [{ user_id: userId }, { user_id: { [Op.is]: null } }],
        },
        transaction: sqlTransaction,
      });

      return subCategory;
    } catch (error) {
      this._logger.error('error in createSubCategory', error);
      throw error;
    }
  }
}
