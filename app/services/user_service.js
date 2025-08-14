import { LoggerFactory } from '../lib/logger.js';
import User from '../models/user.js';

/**
 * UserService handles all user-related operations.
 */
class UserService {
  constructor() {
    this._logger = new LoggerFactory('UserService').logger;
  }
  /**
   * Creates a new user.
   * @param {Object} userData - User data object.
   * @returns {Promise<User>} - The created user record.
   */
  async createUser(userData) {
    return await User.create({
      ...userData,
    });
  }

  /**
   * Finds a user by ID.
   * @param {string} userId - The user's ID.
   * @returns {Promise<User|null>} - The found user or null if not found.
   */
  async getUserById(userId) {
    return await User.findByPk(userId);
  }

  /**
   * Finds a user by phone number.
   * @param {string} phoneNumber - The phone number.
   * @param {string} countryCode - The country code.
   * @returns {Promise<User|null>} - The found user or null if not found.
   */
  async getUserByPhoneNumber(phoneNumber, countryCode = '+91') {
    return await User.findOne({
      where: {
        phone_number: phoneNumber,
        country_code: countryCode,
      },
    });
  }

  /**
   * Updates user details.
   * @param {string} userId - The user's ID.
   * @param {Object} updateData - Fields to update.
   * @returns {Promise<[number, User[]]>} - The number of affected rows.
   */
  async updateUser(userId, updateData) {
    return await User.update(updateData, {
      where: { id: userId },
      returning: true,
    });
  }

  /**
   * Soft deletes a user (marks as inactive instead of removing from DB).
   * @param {string} userId - The user's ID.
   * @returns {Promise<number>} - The number of affected rows.
   */
  async deleteUser(userId) {
    return await User.update({ status: 'INACTIVE' }, { where: { id: userId } });
  }
}

export default UserService;
