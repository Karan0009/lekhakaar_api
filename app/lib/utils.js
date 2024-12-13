import { v1 as uuidv1 } from 'uuid';
import fs from 'fs/promises';

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
}

export default new Utils();
