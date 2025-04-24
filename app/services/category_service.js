import { Op } from 'sequelize';
import { LoggerFactory } from '../lib/logger.js';
import Category from '../models/category.js';

export default class CategoryService {
  constructor() {
    this._logger = new LoggerFactory('CategoryService').logger;
  }

  /**
   * Count and Get all active category
   * @param {{
   *    userId: string,
   *    searchTxt: string,
   *    sqlTransaction: any
   * }} data
   */
  async countAndGetAll({ searchTxt, sqlTransaction = null }) {
    try {
      const whereObj = {};

      if (searchTxt) {
        whereObj['name'] = { [Op.like]: `${searchTxt}%` };
      }
      const categories = await Category.scope('active').findAndCountAll({
        attributes: ['id', 'name', 'description', 'icon'],
        where: whereObj,
        transaction: sqlTransaction,
      });

      return categories;
    } catch (error) {
      this._logger.error('error in countAndGetAll', error);
      throw error;
    }
  }
}
