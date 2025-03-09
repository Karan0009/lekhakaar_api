import fs from 'fs/promises';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import crypto from 'crypto';
import config from '../config/config.js';

dayjs.locale('en', { weekStart: 1 });
dayjs.extend(utc);
dayjs.extend(timezone);

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

  /**
   * @param {import('express').Request} req
   */
  getDeviceFingerprint(req) {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const ip = req.ip;

    const fingerprintData = `${userAgent}-${acceptLanguage}-${ip}`;
    return crypto.createHash('sha256').update(fingerprintData).digest('hex');
  }

  meta(req, count) {
    const totalPages = Math.ceil(count / req.query.limit);
    const nextPageNumber =
      req.query.page < totalPages ? req.query.page + 1 : null;
    return {
      totalCount: count,
      totalPages,
      lastPage: totalPages,
      nextPageNumber: nextPageNumber,
    };
  }
  metaData(count, pageSize, pageNumber) {
    const totalPages = Math.ceil(count / pageSize);
    const nextPageNumber = pageNumber < totalPages ? pageNumber + 1 : null;
    return {
      total_count: count,
      total_pages: totalPages,
      current_page: pageNumber,
      next_page: nextPageNumber,
      last_page: totalPages,
      limit: pageSize,
    };
  }

  /**
   * @param {dayjs.Dayjs} dayjsObj
   * @returns string
   */
  getWeekStartDate(dayjsObj) {
    return dayjsObj.startOf('week').format('YYYY-MM-DD');
  }

  /**
   * @param {dayjs.Dayjs} dayjsObj
   * @returns string
   */
  getMonthStartDate(dayjsObj) {
    return dayjsObj.startOf('month').format('YYYY-MM-DD');
  }

  /**
   *
   * @param {dayjs.Dayjs} dayjsObj
   * @returns string
   */
  getQuarterStartDate(dayjsObj) {
    const month = dayjsObj.month();
    const quarterStartMonth = Math.floor(month / 3) * 3;

    return dayjsObj
      .month(quarterStartMonth)
      .startOf('month')
      .format('YYYY-MM-DD');
  }

  /**
   * @param {dayjs.Dayjs} dayjsObj
   * @returns string
   */
  getYearStartDate(dayjsObj) {
    return dayjsObj.startOf('year').format('YYYY-MM-DD');
  }

  formatAmount(decimalAmount) {
    return parseInt(decimalAmount * 100);
  }
}

export default new Utils();
