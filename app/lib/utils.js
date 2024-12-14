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
    return `http://64.227.188.248:8000/static/${fileName}`;
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
  getDayJsObj(datetime, tz = 'utc') {
    try {
      dayjs.extend(utc);
      dayjs.extend(timezone);
      return datetime ? dayjs(datetime).tz(tz) : dayjs().tz(tz);
    } catch (err) {
      throw err;
    }
  }
}

export default new Utils();
