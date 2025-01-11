export default class BaseOcr {
  constructor() {
    if (new.target === BaseOcr) {
      throw new TypeError('Cannot construct BaseOcr instances directly');
    }
  }

  /**
   *
   * @param {string} base64Image
   */
  processBase64Image(base64Image) {
    throw new Error('Method processBase64Image must be implemented.');
  }

  /**
   *
   * @param {string} imagePath
   */
  processImageFromPath(imagePath) {
    throw new Error('Method processImageFromPath must be implemented.');
  }
}
