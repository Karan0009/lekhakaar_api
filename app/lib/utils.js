import { v1 as uuidv1 } from 'uuid';
import fs from 'fs/promises';

class Utils {
  constructor() {}

  getUUID() {
    return uuidv1();
  }

  async convertImageToBase64(imagePath) {
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    return base64Image;
  }
}

export default new Utils();
