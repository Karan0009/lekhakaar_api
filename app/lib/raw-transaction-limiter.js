import { LoggerFactory } from './logger.js';
import redis from './redis.js';
import config from '../config/config.js';
import dayjs from 'dayjs';

class RawTransactionLimiter {
  constructor() {
    this._logger = new LoggerFactory('RawTransactionLimiter').logger;
  }

  /**
   * check if an user can add new raw transaction
   * @param {string} phoneNumber
   * @returns {boolean}
   */
  async canTransactUserWise(phoneNumber, resetAfterInDays = 1) {
    try {
      const key = `trxn_limit:${phoneNumber}`;
      const remainingLimit = await redis.get(key);
      const now = dayjs();
      const newLimitPayload = JSON.stringify({
        limit: config.MAX_RAW_TRANSACTIONS_LIMIT,
        resetAfter: now
          .add(resetAfterInDays, 'day')
          .set('hour', 1)
          .set('minute', '0')
          .set('second', 0)
          .unix(),
      });
      const curTime = now.unix();
      if (!remainingLimit) {
        await redis.set(key, newLimitPayload);

        return true;
      }
      const remainingLimitJson = JSON.parse(remainingLimit);

      if (remainingLimitJson.limit > 0) {
        await redis.set(
          key,
          JSON.stringify({
            ...remainingLimitJson,
            limit: remainingLimitJson.limit - 1,
          }),
        );

        return true;
      } else if (
        remainingLimitJson.limit <= 0 &&
        remainingLimitJson.resetAfter > curTime
      ) {
        return false;
      } else if (
        remainingLimitJson.limit <= 0 &&
        remainingLimitJson.resetAfter < curTime
      ) {
        await redis.set(key, newLimitPayload);

        return true;
      } else {
        return false;
      }
    } catch (error) {
      this._logger.error('error in canTransact', { error });
      throw error;
    }
  }
}

export default new RawTransactionLimiter();
