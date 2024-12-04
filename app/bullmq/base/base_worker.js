import { Worker } from 'bullmq';
import redis from '../../lib/redis.js';
import { LoggerFactory } from '../../lib/logger.js';

export default class BaseWorker {
  /**
   *
   * @param {{queueName:string,workerOptions:import('bullmq').WorkerOptions}} data
   */
  constructor({ queueName, workerOptions = {} }) {
    this.queueName = queueName;
    this.workerOptions = workerOptions;
    this.logger = new LoggerFactory(`BaseWorker-${queueName}`).logger;
  }

  setupWorker() {
    this.worker = new Worker(this.queueName, this.jobProcessor.bind(this), {
      connection: redis,
      ...this.workerOptions,
    });
  }

  /**
   *
   * @param {Job} job
   */
  async jobProcessor(job) {
    this.logger.info(`starting processing job of ${job.name} with #${job.id}`);
  }
}
