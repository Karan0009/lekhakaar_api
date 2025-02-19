import fs from 'fs/promises';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import crypto from 'crypto';
import config from '../config/config.js';

class Utils {
  constructor() {}

  getStaticImageUrlPath(fileName) {
    return `https://api.fabnest.in/static/${fileName}`;
  }

  async convertImageToBase64(imagePath) {
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    return base64Image;
  }

  /**
   *
   * @param {string | number | dayjs.Dayjs | Date} datetime
   * @param {string} tz
   * @returns
   */
  getDayJsObj(datetime, tz = 'utc', inputFormat = '') {
    try {
      dayjs.extend(utc);
      dayjs.extend(timezone);
      const res = datetime
        ? inputFormat != ''
          ? dayjs(datetime, inputFormat).tz(tz)
          : dayjs(datetime).tz(tz)
        : dayjs().tz(tz);

      if (!res.isValid()) {
        return null;
      }

      return res;
    } catch (err) {
      throw err;
    }
  }

  /**
   *
   * @param {number} length length of result string
   * @returns
   */
  generateRandomDigits(length) {
    if (length <= 0) {
      throw new Error('Length must be greater than 0');
    }
    let result = '';
    const digits = '0123456789';

    for (let i = 0; i < length; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return result;
  }

  generateRandomToken(length) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   *
   * @param {string} str
   * @returns
   */
  getSecureHash(str) {
    return crypto
      .createHmac('sha256', config.SECRET_HASH_KEY)
      .update(str)
      .digest('hex');
  }
}

export default new Utils();
