import config from '../../config/config.js';
import BaseJob from '../base/base_job.js';
import RawTransaction, {
  RAW_TRANSACTION_STATUSES,
  RAW_TRANSACTION_TYPE,
} from '../../models/raw_transaction.js';
import AwsTextractService from '../../lib/ocr/aws_textract_service.js';
const __dirname = import.meta.dirname;
import { join } from 'path';
import OpenaiBatch, {
  OPENAI_BATCH_PURPOSES,
  OPENAI_BATCH_STATUS,
} from '../../models/openai_batch.js';
import { OPEN_AI_PROMPTS } from '../../lib/openai/prompts.js';
import openaiClient from '../../lib/openai/openai.js';
import { unlink, writeFile } from 'fs/promises';
import fs from 'fs';

export default class RawTransactionsDataJob extends BaseJob {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.rawTransactionsDataQueue,
      jobOptions: {
        repeat: {
          pattern: '*/5 * * * *',
        },
      },
    });
    this.ocrService = new AwsTextractService();
  }

  async process(jobData) {
    let sqlTransaction;
    /**
     * @type {RawTransaction[]}
     */
    let pendingRawTransactions = [];
    try {
      this.logger.info('job ran', { jobData });
      // sqlTransaction = await sequelize.transaction();
      pendingRawTransactions = await this.getPendingRawTransactions();
      await this.setRawTransactionsStatus(
        pendingRawTransactions,
        RAW_TRANSACTION_STATUSES.PROCESSING,
      );

      const batchResponse = await this.createBatchFile(pendingRawTransactions);

      if (
        pendingRawTransactions.length > 0 &&
        (!batchResponse || !batchResponse?.fileUploadSuccess)
      ) {
        await this.setRawTransactionsStatus(
          pendingRawTransactions,
          RAW_TRANSACTION_STATUSES.PENDING,
        );
      }

      // await sqlTransaction.commit();
    } catch (error) {
      await this.setRawTransactionsStatus(
        pendingRawTransactions,
        RAW_TRANSACTION_STATUSES.PENDING,
      );
      //   if (sqlTransaction) {
      //     await sqlTransaction.rollback();
      //   }
      this.logger.error('error in process', { error });
      throw error;
    }
  }

  async getPendingRawTransactions(transaction) {
    return RawTransaction.findAll({
      where: {
        raw_transaction_type: [
          RAW_TRANSACTION_TYPE.WA_IMAGE,
          RAW_TRANSACTION_TYPE.WA_TEXT,
        ],
        status: RAW_TRANSACTION_STATUSES.PENDING,
      },
      order: [['created_at', 'ASC']],
      limit: config.RAW_TRANSACTIONS_AI_TEXT_ANALYSIS_JOB_BATCH_SIZE,
      transaction,
    });
  }

  /**
   *
   * @param {RawTransaction[]} rawTransactions
   * @param {string} status
   * @param {*} transaction
   * @returns
   */
  async setRawTransactionsStatus(rawTransactions, status, transaction) {
    return RawTransaction.update(
      {
        status,
      },
      {
        where: {
          id: rawTransactions.map((t) => t.id) || [],
        },
        transaction,
      },
    );
  }

  /**
   *
   * @param {RawTransaction[]} pendingRawTransactions
   * @param {Transaction} transaction
   */
  async createBatchFile(pendingRawTransactions, transaction) {
    let newBatch;
    try {
      if (pendingRawTransactions.length === 0) return null;

      const tasks = [];
      newBatch = await OpenaiBatch.create({
        purpose: OPENAI_BATCH_PURPOSES.RAW_TRANSACTION_DATA_EXTRACTION,
      });
      for (let i = 0; i < pendingRawTransactions.length; ++i) {
        const rawTransaction = pendingRawTransactions[i];
        let rawTransactionText = this.getRawTransactionText(rawTransaction);
        const task = {
          custom_id: rawTransaction.id,
          method: 'POST',
          url: '/v1/chat/completions',
          body: {
            model: 'gpt-3.5-turbo',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'user',
                content:
                  OPEN_AI_PROMPTS.rawTransactionDataExtractionPrompt(
                    rawTransactionText,
                  ),
              },
            ],
          },
        };

        tasks.push(task);
      }

      const batchFolderName = 'openai_batch_files';
      const batchFolderPath = join(__dirname, `../../../${batchFolderName}`);
      if (!fs.existsSync(batchFolderPath)) {
        await mkdir(batchFolderPath, { recursive: true });
      }
      const batchFilePath = `${batchFolderName}/raw_transaction_batch_${newBatch.id}.jsonl`;

      for (let i = 0; i < tasks.length; ++i) {
        await writeFile(batchFilePath, JSON.stringify(tasks[i]) + '\n', {
          flag: 'a',
        });
      }
      const localFilePath = join(__dirname, '../../../', batchFilePath);
      let fileUploadRes;
      try {
        fileUploadRes = await openaiClient.files.create({
          file: fs.createReadStream(localFilePath),
          purpose: 'batch',
        });
      } catch (error) {
        await unlink(batchFilePath);
        this.logger.error('error in uploading batch file', { error });
        return { fileUploadSuccess: false, batchJobSuccess: false };
      }
      await newBatch.update({ file_path: batchFilePath, meta: fileUploadRes });

      let batchJob;
      try {
        batchJob = await openaiClient.batches.create({
          input_file_id: fileUploadRes.id,
          endpoint: '/v1/chat/completions',
          completion_window: '24h',
        });
      } catch (error) {
        this.logger.error('error in creating batch job', { error });
        return { fileUploadSuccess: true, batchJobSuccess: false };
      }

      await newBatch.update({
        batch_job: batchJob,
        status: batchJob
          ? OPENAI_BATCH_STATUS.PENDING
          : OPENAI_BATCH_STATUS.INVALID_BATCH_JOB,
      });

      return {
        fileUploadSuccess: true,
        batchJobSuccess: true,
        batch: newBatch,
      };
    } catch (error) {
      if (newBatch) {
        await newBatch.update({ status: OPENAI_BATCH_STATUS.FAILED });
      }
      this.logger.error('error in createBatchFile', { error });

      return null;
    }
  }

  /**
   *
   * @param {RawTransaction} rawTransaction
   * @returns {string | null}
   */
  getRawTransactionText(rawTransaction) {
    if (rawTransaction.raw_transaction_type === RAW_TRANSACTION_TYPE.WA_IMAGE)
      return rawTransaction.extracted_text;
    else if (
      rawTransaction.raw_transaction_type === RAW_TRANSACTION_TYPE.WA_TEXT
    )
      return rawTransaction.raw_transaction_data;

    return null;
  }
}
