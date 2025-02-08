import { v1 as uuidv1 } from 'uuid';
import fs from 'fs/promises';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

class Utils {
  constructor() {}

  getUUID() {
    return uuidv1();
  }

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
}

export default new Utils();
