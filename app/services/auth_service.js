import { LoggerFactory } from '../lib/logger.js';
import sequelize from '../lib/sequelize.js';
import User from '../models/user.js';
import utils from '../lib/utils.js';

class AuthService {
  constructor() {
    this.logger = new LoggerFactory('AuthRegister').logger;
  }

  async doesUserExist(phoneNumber, countryCode = '+91', transaction = null) {
    return User.findOne({
      where: { phone_number: phoneNumber, country_code: countryCode },
      transaction,
      useMaster: true,
    });
  }

  async registerUser(phoneNumber, countryCode = '+91') {
    let sqlTransaction = null;
    try {
      sqlTransaction = await sequelize.transaction();
      const user = await this.doesUserExist(
        phoneNumber,
        countryCode,
        sqlTransaction,
      );
      if (user) return { user, alreadyExist: true };

      const userParams = {
        phone_number: phoneNumber,
        country_code: countryCode,
      };

      const newUser = await User.create(userParams);

      await sqlTransaction.commit();
      return { user: newUser, alreadyExist: false };
    } catch (err) {
      if (sqlTransaction) {
        await sqlTransaction.rollback();
      }
      this.logger.error('error in registerUser', { error: err });
      throw err;
    }
  }
}

export default new AuthService();
