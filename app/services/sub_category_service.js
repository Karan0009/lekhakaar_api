import { Op } from 'sequelize';
import { LoggerFactory } from '../lib/logger.js';
import SubCategory, { SUB_CATEGORY_STATUSES } from '../models/sub_category.js';
import redis from '../lib/redis.js';
import config from '../config/config.js';

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
      const redisKey = `sub_cat_name_user:${name}:${userId ?? ''}`;
      const cachedSubCat = await redis.get(redisKey);
      if (cachedSubCat) {
        return JSON.parse(cachedSubCat);
      }

      const userIdChecks = [{ user_id: { [Op.is]: null } }];

      if (userId) {
        userIdChecks.push({ user_id: userId });
      }

      const subCategory = await SubCategory.findOne({
        where: {
          name: name,
          [Op.or]: userIdChecks,
        },
        raw: true,
        transaction: sqlTransaction,
      });

      if (subCategory) {
        await redis.set(
          redisKey,
          JSON.stringify(subCategory),
          'EX',
          config.times.hours_24_in_s,
        );

        return subCategory;
      }
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
  async getSubCategoryByIdAndUserId(id, userId, sqlTransaction = null) {
    try {
      const redisKey = `sub_cat_id_user:${id}:${userId ?? ''}`;
      const cachedSubCat = await redis.get(redisKey);
      if (cachedSubCat) {
        return JSON.parse(cachedSubCat);
      }

      const userIdChecks = [{ user_id: { [Op.is]: null } }];

      if (userId) {
        userIdChecks.push({ user_id: userId });
      }

      const subCategory = await SubCategory.findOne({
        where: {
          id,
          [Op.or]: userIdChecks,
        },
        raw: true,
        transaction: sqlTransaction,
      });

      if (subCategory) {
        await redis.set(
          redisKey,
          JSON.stringify(subCategory),
          'EX',
          config.times.hours_24_in_s,
        );

        return subCategory;
      }
    } catch (error) {
      this._logger.error('error in createSubCategory', error);
      throw error;
    }
  }
}
