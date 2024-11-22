import { LoggerFactory } from '../lib/logger.js';

class WaWebService {
  constructor() {
    this.logger = new LoggerFactory('WaWebService').logger;
  }
}

export default new WaWebService();
