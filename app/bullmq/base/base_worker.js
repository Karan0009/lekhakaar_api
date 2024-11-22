import { Worker } from 'bullmq';
import redis from '../../lib/redis';
import { LoggerFactory } from '../../lib/logger';

export default class BaseWorker {
  constructor({ queueName, workerOptions = {} }) {
    this.queueName = queueName;
    this.workerOptions = workerOptions;
    this.logger = new LoggerFactory('BaseWorker').logger;
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
  jobProcessor(job) {
    this.logger.info(`starting processing job of ${job.name} with #${job.id}`);
  }
}
