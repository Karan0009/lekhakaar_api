import {
  TextractClient,
  DetectDocumentTextCommand,
} from '@aws-sdk/client-textract';
import BaseOcr from './base/base_ocr.js';
import fs from 'fs/promises';
import config from '../../config/config.js';
import { LoggerFactory } from '../logger.js';

export default class AwsTextractService extends BaseOcr {
  constructor() {
    super();
    this._logger = new LoggerFactory(`AwsTextractService`).logger;
    this._textractClient = new TextractClient({
      region: config.AWS.region,
      credentials: {
        accessKeyId: config.AWS.accessKeyId,
        secretAccessKey: config.AWS.secretAccessKey,
      },
    });
  }

  /**
   * @param {string} base64Image
   */
  async processBase64Image(base64Image) {
    const buffer = Buffer.from(base64Image, 'base64');
    const params = {
      Document: {
        Bytes: buffer,
      },
    };

    const command = new DetectDocumentTextCommand(params);
    try {
      const response = await this._textractClient.send(command);

      return response;
    } catch (error) {
      this._logger.error('Error processing base64 image with Textract', {
        error,
      });

      throw error;
    }
  }

  /**
   * @param {string} imagePath
   */
  async processImageFromPath(imagePath) {
    try {
      const buffer = await fs.readFile(imagePath);
      const params = {
        Document: {
          Bytes: buffer,
        },
      };

      const command = new DetectDocumentTextCommand(params);
      const response = await this._textractClient.send(command);

      return response;
    } catch (error) {
      this._logger.error('Error processing image from path with Textract', {
        error,
      });

      throw error;
    }
  }

  /**
   *
   * @param {import('@aws-sdk/client-textract').DetectDocumentTextCommandOutput} textractResponse
   * @returns
   */
  getRawText(textractResponse) {
    const rawText = textractResponse.Blocks.filter(
      (block) => block.BlockType === 'LINE',
    )
      .map((line) => line.Text)
      .join('\n');

    return rawText;
  }
}
