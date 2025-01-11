import { LoggerFactory } from '../lib/logger.js';
import BaseJob from './base/base_job.js';

class CronChecker {
  constructor() {
    this.logger = new LoggerFactory('CronChecker').logger;
  }

  /**
   *
   * @param {number} ms
   * @param {BaseJob[]} jobInstances
   * @returns
   */
  async startCronChecker(ms, jobInstances) {
    if (!ms || ms <= 0) {
      this.logger.error('ms is invalid');
      return;
    }
    // start the first time and then check every on every ms interval
    await this.addCronJobsIfNotAlreadyAdded(jobInstances);
    setInterval(async () => {
      await this.addCronJobsIfNotAlreadyAdded(jobInstances);
    }, ms);
  }

  /**
   *
   * @param {BaseJob[]} jobInstances
   */
  async addCronJobsIfNotAlreadyAdded(jobInstances) {
    try {
      if (!jobInstances || jobInstances?.length === 0) {
        this.logger.error('jobInstances is invalid/empty');
        return;
      }

      for (let i = 0; i < jobInstances.length; i++) {
        const jobInstance = jobInstances[i];
        const jobsCount =
          (await jobInstance.queue.getDelayedCount()) +
          (await jobInstance.queue.getActiveCount());
        if (jobsCount === 0) {
          this.logger.info('job has 0 jobs, adding new job');
          await jobInstance.add({});
        }
      }
      this.logger.info('all cron jobs are active');
    } catch (err) {
      this.logger.error('error in addCronJobsIfNotAlreadyAdded', { err });
    }
  }
}

export default new CronChecker();
