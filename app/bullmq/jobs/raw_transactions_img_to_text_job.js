import config from '../../config/config.js';
import BaseJob from '../base/base_job.js';
import RawTransaction, {
  RAW_TRANSACTION_STATUSES,
  RAW_TRANSACTION_TYPE,
} from '../../models/raw_transaction.js';
import sequelize from 'sequelize';
import AwsTextractService from '../../lib/ocr/aws_textract_service.js';
const __dirname = import.meta.dirname;
import { join } from 'path';

export default class RawTransactionsImgToTextJob extends BaseJob {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.rawTransactionsImgToTextQueue,
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
    let pendingRawTransactionsWithImage = [];
    try {
      this.logger.info('job ran', { jobData });
      // sqlTransaction = await sequelize.transaction();
      pendingRawTransactionsWithImage =
        await this.getPendingRawTransactionsWithImage();
      await this.setRawTransactionsStatus(
        pendingRawTransactionsWithImage,
        RAW_TRANSACTION_STATUSES.EXTRACTING_TEXT,
      );

      // TODO: OPTIMIZE THIS PROCESSING
      const failedRawTransactions = [];
      const failedRawTransactionsWithImages = [];
      for (let i = 0; i < pendingRawTransactionsWithImage.length; i++) {
        const rawTrxn = pendingRawTransactionsWithImage[i];
        const imageName = rawTrxn.raw_transaction_data.split('/')[1];
        const imagePath = join(config.MEDIA_UPLOAD_PATH, 'uploads', imageName);
        let imageText = '';

        try {
          imageText = this.ocrService.getRawText(
            await this.ocrService.processImageFromPath(imagePath),
          );
        } catch (error) {
          this.logger.error('error in processImageFromPath', { error });
          failedRawTransactionsWithImages.push(rawTrxn);

          continue;
        }
        this.logger.info('updating processed raw trxn');
        await rawTrxn.update({
          extracted_text: imageText,
          status: RAW_TRANSACTION_STATUSES.PENDING,
        });
      }

      await this.setRawTransactionsStatus(
        failedRawTransactions,
        RAW_TRANSACTION_STATUSES.PENDING,
      );
      await this.setRawTransactionsStatus(
        failedRawTransactionsWithImages,
        RAW_TRANSACTION_STATUSES.PENDING_TEXT_EXTRACTION,
      );

      // await sqlTransaction.commit();
    } catch (error) {
      await this.setRawTransactionsStatus(
        pendingRawTransactionsWithImage,
        RAW_TRANSACTION_STATUSES.PENDING_TEXT_EXTRACTION,
      );
      //   if (sqlTransaction) {
      //     await sqlTransaction.rollback();
      //   }
      this.logger.error('error in process', { error });
      throw error;
    }
  }

  async getPendingRawTransactionsWithImage(transaction) {
    return RawTransaction.findAll({
      where: {
        raw_transaction_type: RAW_TRANSACTION_TYPE.WA_IMAGE,
        status: RAW_TRANSACTION_STATUSES.PENDING_TEXT_EXTRACTION,
      },
      order: [['created_at', 'ASC']],
      limit: config.RAW_TRANSACTIONS_IMAGE_TO_TEXT_JOB_BATCH_SIZE,
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
}
