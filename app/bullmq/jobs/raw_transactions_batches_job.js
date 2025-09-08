import config from '../../config/config.js';
import BaseJob from '../base/base_job.js';
import RawTransaction, {
  RAW_TRANSACTION_STATUSES,
  RAW_TRANSACTION_TYPE,
} from '../../models/raw_transaction.js';
import OpenaiBatch, {
  OPENAI_BATCH_PURPOSES,
  OPENAI_BATCH_STATUS,
} from '../../models/openai_batch.js';
import openaiClient from '../../lib/openai/openai.js';
import sequelize from '../../lib/sequelize.js';
import utils from '../../lib/utils.js';
import UserTransactionService from '../../services/user_transaction_service.js';
import { CREATION_SOURCE } from '../../models/user_transaction.js';

export default class RawTransactionsBatchesJob extends BaseJob {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.rawTransactionsBatchesQueue,
      jobOptions: {
        removeOnComplete: 2,
        // process this job every 2 minutes
        repeat: {
          pattern: '*/2 * * * *',
        },
      },
    });
  }

  async process(jobData) {
    let sqlTransaction;
    /**
     * @type {RawTransaction[]}
     */
    let pendingBatches = [];
    try {
      // TODO: OPTIMIZE PROCESSING, DB QUERIES
      this.logger.info('job ran', { jobData });
      pendingBatches = await this.getPendingBatches();
      if (!pendingBatches || pendingBatches?.length === 0) return;
      sqlTransaction = await sequelize.transaction();
      await this.getAndUpdateProcessedBatchJobs(pendingBatches, sqlTransaction);

      await sqlTransaction.commit();
    } catch (error) {
      this.logger.error(
        'error in processing raw transactions batches job',
        error,
      );
      await this.setOpenaiBatchStatus(
        pendingBatches.map((i) => i.id),
        OPENAI_BATCH_STATUS.PENDING,
      );
      if (sqlTransaction) {
        await sqlTransaction.rollback();
        this.logger.error('transaction rolled back');
      }
      this.logger.error('error in process', error);
      throw error;
    }
  }

  async getPendingBatches(transaction) {
    return OpenaiBatch.findAll({
      where: {
        status: OPENAI_BATCH_STATUS.PENDING,
        purpose: OPENAI_BATCH_PURPOSES.RAW_TRANSACTION_DATA_EXTRACTION,
      },
      order: [['id', 'ASC']],
      limit: config.RAW_TRANSACTIONS_BATCHES_JOB_BATCH_SIZE,
      transaction,
    });
  }

  async setOpenaiBatchStatus(batchIds, status, transaction) {
    return OpenaiBatch.update(
      {
        status,
      },
      {
        where: {
          id: batchIds || [],
        },

        transaction,
      },
    );
  }

  /**
   *
   * @param {Array<OpenaiBatch>} pendingBatches
   * @param {Transaction} transaction
   */
  async getAndUpdateProcessedBatchJobs(pendingBatches, transaction) {
    try {
      const { failedBatches, invalidJobBatches, processedBatches } =
        await this.checkBatchJobsStatuses(pendingBatches, transaction);
      await this.handleInvalidJobBatches(invalidJobBatches, transaction);

      await this.handleRetryFailedBatches(failedBatches, transaction);

      await this.handleProcessedBatches(processedBatches, transaction);

      return processedBatches;
    } catch (error) {
      this.logger.error('error in getProcessedBatches', error);
      throw error;
    }
  }

  /**
   *
   * @param {OpenaiBatch[]} pendingBatches
   * @param {Transaction} transaction
   */
  async checkBatchJobsStatuses(pendingBatches, transaction) {
    const processedBatches = [];
    const failedBatches = [];
    const invalidJobBatches = [];
    const updateBatchPromises = [];
    for (let i = 0; i < pendingBatches.length; ++i) {
      const batch = pendingBatches[i];
      let batchJob;
      if (batch?.batch_job) {
        batchJob = await openaiClient.batches.retrieve(batch?.batch_job?.id);
      }
      if (batchJob && batchJob?.status === 'completed') {
        updateBatchPromises.push(
          batch.update(
            {
              status: OPENAI_BATCH_STATUS.PROCESSING,
            },
            {
              transaction,
            },
          ),
        );
        processedBatches.push({ batchJob, batch });
      } else if (batchJob && batchJob?.status === 'failed') {
        failedBatches.push({
          batch,
          batchJob,
          failedRemark: batchJob?.errors?.data[0]?.code,
        });
      } else if (!batchJob) {
        invalidJobBatches.push(batch);
      } else {
        this.logger.error('either null batchJob or different batchJob status', {
          status: batchJob?.status || '',
        });
      }
    }

    await Promise.all(updateBatchPromises);

    return { processedBatches, failedBatches, invalidJobBatches };
  }

  async openaiFileToJsonObjects(fileId) {
    try {
      let fileObj;
      fileObj = await openaiClient.files.content(fileId);

      let resultObjects;
      if (fileObj) {
        const fileContent = await fileObj.text();
        resultObjects = fileContent
          .split('\n')
          .filter((o) => o)
          .map((o) => JSON.parse(o));
      }

      return resultObjects;
    } catch (error) {
      this.logger.error('error in openaiFileToJsonObjects', error);

      return null;
    }
  }

  /**
   *
   * @param {Array<OpenaiBatch>} invalidJobBatches
   * @param {*} transaction
   */
  async handleInvalidJobBatches(invalidJobBatches, transaction) {
    for (let i = 0; i < invalidJobBatches.length; ++i) {
      try {
        const batch = invalidJobBatches[i];
        const { meta } = batch;
        let batchJob;
        if (!meta || !meta.id) {
          await batch.update(
            {
              status: OPENAI_BATCH_STATUS.FAILED,
              remark: 'invalid meta',
              batch_job: null,
            },
            {
              transaction,
            },
          );
          continue;
        }

        if (meta && meta.id) {
          try {
            batchJob = await openaiClient.batches.create({
              input_file_id: meta.id,
              endpoint: '/v1/chat/completions',
              completion_window: '24h',
            });
          } catch (error) {
            this.logger.error('error in creating batch job', error);
          }
        }

        if (batchJob) {
          await batch.update(
            {
              status: OPENAI_BATCH_STATUS.PENDING,
              batch_job: batchJob,
            },
            {
              transaction,
            },
          );
        }
      } catch (error) {
        this.logger.error('error in handleInvalidJobBatches', error);
        continue;
      }
    }
  }

  /**
   *
   * @param {Array<{batch:OpenaiBatch,batchJob:import('openai/resources/batches.mjs').Batch,failedRemark:string}>} failedBatches
   * @param {*} transaction
   */
  async handleRetryFailedBatches(failedBatches, transaction) {
    for (let i = 0; i < failedBatches.length; ++i) {
      try {
        const { batch, batchJob, failedRemark } = failedBatches[i];

        const inputFileObjects = await this.openaiFileToJsonObjects(
          batchJob.input_file_id,
        );

        if (!inputFileObjects) {
          continue;
        }

        await batch.update(
          {
            status: OPENAI_BATCH_STATUS.FAILED,
            remark: failedRemark,
            batch_job: batchJob,
          },
          {
            transaction,
          },
        );
        const customIds = inputFileObjects
          .map((o) => o.custom_id)
          .filter((str) => str);

        await RawTransaction.update(
          {
            status: RAW_TRANSACTION_STATUSES.PENDING,
          },
          {
            where: {
              id: customIds || [],
            },
            transaction,
          },
        );
      } catch (error) {
        this.logger.error('error in handleRetryFailedBatches', error);
        continue;
      }
    }
  }

  /**
   *
   * @param {Array<{batch:OpenaiBatch,batchJob:import('openai/resources/batches.mjs').Batch,failedRemark:string}>} failedBatches
   * @param {*} transaction
   */
  async handleProcessedBatches(processedBatches, transaction) {
    const processedFilesContent = [];

    for (let i = 0; i < processedBatches.length; ++i) {
      const processedBatch = processedBatches[i];
      const resultFileId = processedBatch.batchJob.output_file_id;

      const resultObjects = await this.openaiFileToJsonObjects(resultFileId);
      if (!resultObjects) {
        continue;
      }

      await processedBatch.batch.update(
        {
          status: OPENAI_BATCH_STATUS.PROCESSED,
        },
        {
          transaction,
        },
      );
      processedFilesContent.push(...resultObjects);
    }

    for (let i = 0; i < processedFilesContent.length; ++i) {
      const result = processedFilesContent[i];
      const rawTrxnId = result?.custom_id;
      const response = JSON.parse(
        result?.response?.body?.choices[0].message.content,
      );

      const rawTrxn = await RawTransaction.findOne({
        where: {
          id: rawTrxnId,
          //TODO: UNCOMMENT AFTER :status: RAW_TRANSACTION_STATUSES.PROCESSING,
        },
        transaction,
      });
      if (!rawTrxn || !rawTrxn?.user_id) {
        this.logger.error('raw processing question not found', {
          rawTrxnId,
        });
        continue;
      }

      if (
        !response ||
        response?.amount == null ||
        response?.amount <= 0 ||
        response?.datetime == null ||
        response.recipient == null ||
        utils.getDayJsObj(response.datetime) == null
      ) {
        await this._handleUserTrxnCreateError(rawTrxn, transaction);
        continue;
      }

      const userTransactionService = new UserTransactionService();
      // TODO: FETCH UNCATEGORIZED SUB_CATEGORY AND THEN USE IT'S ID
      try {
        const newUserTransaction =
          await userTransactionService.createUserTransaction(
            {
              user_id: rawTrxn.user_id,
              sub_cat_id: 1, // uncategorized transaction id
              amount: response.amount,
              isIntAmount: false,
              transaction_datetime: response.datetime,
              recipient_name: response.recipient,
              creation_source: this._getCreationSource(rawTrxn),
              meta: response,
            },
            transaction,
          );

        // TODO: AFTER AUTO CATEGORIZATION IS DONE CHANGE THIS CODE

        await rawTrxn.update(
          {
            status: RAW_TRANSACTION_STATUSES.PROCESSED,
            transaction_id: newUserTransaction.id,
          },
          {
            transaction,
          },
        );

        const cacheKeyPrefix = `transactions:${rawTrxn.user_id}:`;
        await utils.deleteAllKeysWithPrefix(cacheKeyPrefix);
      } catch (error) {
        this.logger.error(
          `error in creating user transaction for rawTrxn ${rawTrxn.id}`,
          error,
        );
        await this._handleUserTrxnCreateError(rawTrxn, transaction);
        continue;
      }
    }
    this.logger.info('processed processedBatches');
  }

  async _handleUserTrxnCreateError(rawTrxn, transaction) {
    this.logger.error(`response is invalid ${rawTrxn.id}`);

    await rawTrxn.update(
      {
        status: RAW_TRANSACTION_STATUSES.FAILED,
      },
      {
        transaction,
      },
    );
  }

  _getCreationSource(rawTrxn) {
    if (
      [RAW_TRANSACTION_TYPE.WA_IMAGE, RAW_TRANSACTION_TYPE.WA_TEXT].includes(
        rawTrxn.raw_transaction_type,
      )
    ) {
      return CREATION_SOURCE.wa_service;
    } else if (rawTrxn.raw_transaction_type === RAW_TRANSACTION_TYPE.SMS_READ) {
      return CREATION_SOURCE.sms_read;
    }

    return CREATION_SOURCE.app;
  }
}
