import { Queue } from 'bullmq';
import redis from '../../lib/redis.js';
import { LoggerFactory } from '../../lib/logger.js';

export default class BaseJob {
  /**
   *
   * @param {{queueName:string,jobOptions:import('bullmq').JobsOptions}} data
   */
  constructor({ queueName, jobOptions }) {
    this.logger = new LoggerFactory('BaseJob').logger;
    this.queue = new Queue(queueName, {
      connection: redis,
      defaultJobOptions: jobOptions,
    });
  }

  addEventListeners() {
    this.queue.on('error', this.onError.bind(this));
  }

  add(data) {
    this.queue.add(`${this.queue.name}-job`, data);
  }

  onError(err) {
    this.logger.error('error occured in processing job', { error: err });
  }
}
