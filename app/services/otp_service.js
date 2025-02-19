import { Op } from 'sequelize';
import Otp, { OTP_STATUSES } from '../models/otp.js';
import utils from '../lib/utils.js';
import { LoggerFactory } from '../lib/logger.js';
import redis from '../lib/redis.js';

class OtpService {
  constructor() {
    this._logger = new LoggerFactory('OtpService').logger;
  }
  /**
   * Generates a new OTP for a user.
   * @param {number} otpLength
   * @param {number} otpLifeDurationInSec
   * @returns {Promise<{newOtp:Otp,otpCode:string}>} - The created OTP record.
   */
  async generateOtp(otpLength, otpLifeDurationInSec) {
    const otpCode = utils.generateRandomDigits(otpLength);
    const expiryTime = utils
      .getDayJsObj()
      .add(otpLifeDurationInSec, 'seconds')
      .toISOString();
    const hashedOtp = utils.getSecureHash(otpCode);

    const newOtp = await Otp.create({
      otp_code: hashedOtp,
      expiry_at: expiryTime,
      status: OTP_STATUSES.PENDING,
    });
    return { newOtp: newOtp, otpCode: otpCode };
  }

  /**
   * Verifies an OTP by checking if it exists and is not expired.
   * @param {string} otpCode - The OTP code to verify.
   * @returns {Promise<boolean>} - Returns true if OTP is valid, otherwise false.
   */
  async verifyOtp(otpId, otpCode, phoneNumber) {
    const hashedOtp = utils.getSecureHash(otpCode);

    const userOtpVerifyKey = `user_login_otp:verify:${phoneNumber}`;
    const otpObj = await redis.get(userOtpVerifyKey);

    if (!otpObj) {
      return false;
    }

    if (JSON.parse(otpObj).otp_code !== hashedOtp) {
      return false;
    }

    await Otp.update(
      { status: OTP_STATUSES.VERIFIED },
      { where: { id: otpId } },
    );

    // const otpRecord = await Otp.findOne({
    //   where: {
    //     id: otpId,
    //     status: OTP_STATUSES.PENDING,
    //   },
    // });

    // if (!otpRecord || otpRecord.otp_code !== hashedOtp) {
    //   this._logger.info('invalid otp');
    //   return false;
    // }

    this._logger.info('otp verified successfully');
    return true;
  }

  /**
   * Deletes old OTPs from the database.
   * @param {number} days - Number of days after which OTPs should be deleted.
   * @returns {Promise<number>} - Number of deleted OTP records.
   */
  async deleteOldOtps(days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - days);

    return await Otp.destroy({
      where: {
        created_at: { [Op.lte]: expiryDate },
      },
    });
  }
}

export default new OtpService();
