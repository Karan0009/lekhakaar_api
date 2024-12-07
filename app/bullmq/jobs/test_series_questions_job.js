import config from '../../config/config.js';
import BaseJob from '../base/base_job.js';
import { join } from 'node:path';
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import fs from 'fs';
import TestSeriesRawQuestion, {
  TEST_SERIES_RAW_QUESTION_STATUSES,
} from '../../models/test_series_raw_question.js';
import sequelize from '../../lib/sequelize.js';
import { Transaction } from 'sequelize';
import openaiClient from '../../lib/openai/openai.js';
import utils from '../../lib/utils.js';

import { OPEN_AI_PROMPTS } from '../../lib/openai/prompts.js';
import OpenaiBatch, { OPENAI_BATCH_STATUS } from '../../models/openai_batch.js';
const __dirname = import.meta.dirname;

export default class TestSeriesQuestionsJob extends BaseJob {
  constructor() {
    super({
      queueName: config.BULL_MQ_QUEUES.testSeriesQuestionsQueue,
      jobOptions: {
        repeat: {
          pattern: '*/5 * * * *',
        },
      },
    });
  }

  async process(jobData) {
    let sqlTransaction;
    let pendingQuestions = [];
    try {
      this.logger.info('job ran', { jobData });
      //   sqlTransaction = await sequelize.transaction();
      pendingQuestions = await this.getPendingQuestions();
      await this.setTestSeriesQuestionStatus(
        pendingQuestions.map((q) => q.id),
        TEST_SERIES_RAW_QUESTION_STATUSES.PROCESSING,
      );

      const batchResponse = await this.createBatchFile(pendingQuestions);

      if (!batchResponse || !batchResponse?.fileUploadSuccess) {
        await this.setTestSeriesQuestionStatus(
          pendingQuestions.map((q) => q.id),
          TEST_SERIES_RAW_QUESTION_STATUSES.PENDING,
        );
      }

      await sqlTransaction.commit();
    } catch (error) {
      await this.setTestSeriesQuestionStatus(
        pendingQuestions.map((q) => q.id),
        TEST_SERIES_RAW_QUESTION_STATUSES.PENDING,
      );
      //   if (sqlTransaction) {
      //     await sqlTransaction.rollback();
      //   }
      this.logger.error('error in process', { error });
      throw error;
    }
  }

  async getPendingQuestions(transaction) {
    return TestSeriesRawQuestion.findAll({
      where: {
        status: TEST_SERIES_RAW_QUESTION_STATUSES.PENDING,
      },
      order: [['created_at', 'ASC']],
      limit: config.TEST_SERIES_QUESTIONS_JOB_BATCH_SIZE,
      transaction,
    });
  }

  async setTestSeriesQuestionStatus(pendingQuestionIds, status, transaction) {
    return TestSeriesRawQuestion.update(
      {
        status,
      },
      {
        where: {
          id: pendingQuestionIds || [],
          status: TEST_SERIES_RAW_QUESTION_STATUSES.PENDING,
        },

        transaction,
      },
    );
  }

  /**
   *
   * @param {Array<TestSeriesRawQuestion>} pendingQuestions
   * @param {Transaction} transaction
   */
  async createBatchFile(pendingQuestions, transaction) {
    let newBatch;
    try {
      const tasks = [];
      newBatch = await OpenaiBatch.create({});
      for (let i = 0; i < pendingQuestions.length; ++i) {
        const question = pendingQuestions[i];
        const imagePath = join(
          __dirname,
          '../../../',
          question.raw_question_data,
        );
        const base64Str = await utils.convertImageToBase64(imagePath);

        const task = {
          custom_id: question.id,
          method: 'POST',
          url: '/v1/chat/completions',
          body: {
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: OPEN_AI_PROMPTS.testSeriesRawQuestionSystemPrompt,
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Str}`,
                      detail: 'auto',
                    },
                  },
                ],
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
      const batchFilePath = `${batchFolderName}/test_series_questions_batch_${newBatch.id}.jsonl`;

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

      await newBatch.update({ batchJob: batchJob });

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
   * @param {Array<TestSeriesRawQuestion>} pendingQuestions
   * @param {Transaction} transaction
   */
  async getDataInsidePendingQuestionImages(pendingQuestions, transaction) {
    const pendingQuestionImagePaths = [
      'uploads/8586046020_trxn_1732543155338.jpeg',
      'uploads/8586046020_trxn_1732543155337.jpeg',
      'uploads/8586046020_trxn_1732543155338.jpeg',
    ];
    // pendingQuestions.map(
    //   (q) => q.raw_question_data,
    // );

    for (let i = 0; i < pendingQuestionImagePaths.length; ++i) {
      const imagePath = join(
        __dirname,
        '../../../',
        pendingQuestionImagePaths[i],
      );
      const base64Str = await utils.convertImageToBase64(imagePath);

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: OPEN_AI_PROMPTS.testSeriesRawQuestionSystemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Str}`,
                  detail: 'auto',
                },
              },
            ],
          },
        ],
      });

      this.logger.info('response', { response });
    }
  }
}
