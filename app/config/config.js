import dotenv from 'dotenv';
dotenv.config({
  override: true,
});
const defaultConfig = {
  APP_NAME: process.env.APP_NAME || 'lekhakaar-api',
  PORT: process.env.PORT || 8000,
  PG_DATABASE: {
    username: process.env.PG_DB_USERNAME || 'fabnest-test',
    password: process.env.PG_DB_PASSWORD || 'fabnest-test',
    database: process.env.PG_DB_NAME || 'lekhakaar',
    host: process.env.PG_DB_HOST || 'localhost',
    port: process.env.PG_DB_PORT || 5432,
    ssl: process.env.PG_DB_SSL_MODE == 'true',
    dialect: 'postgres',
    replication: {
      write: {
        host: process.env.PG_DB_HOST || 'localhost', // Primary database for writes
        username: process.env.PG_DB_USERNAME || 'fabnest-test',
        password: process.env.PG_DB_PASSWORD || 'fabnest-test',
        port: process.env.PG_DB_PORT || 5432,
      },
      read: [
        {
          host: process.env.PG_DB_HOST || 'localhost', // First read replica
          username: process.env.PG_DB_USERNAME || 'fabnest-test',
          password: process.env.PG_DB_PASSWORD || 'fabnest-test',
          port: process.env.PG_DB_PORT || 5432,
        },
      ],
    },
    pool: {
      max: 10, // Adjust these settings as per your app's load
      min: 0,
      idle: 10000,
    },
  },
  REDIS: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0, // Defaults to 0
  },
  MAX_RAW_TRANSACTIONS_LIMIT: 200,
  BULL_UI_PATH: '/bullui',
  BULL_MQ_QUEUES: {
    testSeriesQuestionsQueue: 'test-series-questions-queue',
    testSeriesQuestionsBatchesQueue: 'test-series-questions-batches-queue',
    createTestSeriesQueue: 'create-test-series-queue',
    rawTransactionsImgToTextQueue: 'raw-transactions-img-to-text-queue',
    rawTransactionsDataQueue: 'raw-transactions-data-queue',
    rawTransactionsBatchesQueue: 'raw-transactions-batches-queue',
  },
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  TEST_SERIES_QUESTIONS_JOB_BATCH_SIZE: 5,
  TEST_SERIES_QUESTIONS_BATCHES_JOB_BATCH_SIZE: 10,
  RAW_TRANSACTIONS_IMAGE_TO_TEXT_JOB_BATCH_SIZE: 5,
  RAW_TRANSACTIONS_AI_TEXT_ANALYSIS_JOB_BATCH_SIZE: 10,
  RAW_TRANSACTIONS_BATCHES_JOB_BATCH_SIZE: 20,
  times: {
    mins_30_in_ms: 1800000,
    mins_15_in_s: 900,
    mins_4_in_s: 120,
    mins_2_in_s: 120,
    mins_1_in_s: 60,
    mins_30_in_s: 1800,
    hours_1_in_s: 3600,
    hours_12_in_s: 43200,
    hours_24_in_s: 86400,
  },
  downloads_root_folder: 'downloads',
  AWS: {
    region: process.env.AWS_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  SECRET_HASH_KEY: process.env.SECRET_HASH_KEY || 'secret-key',
  WA_GRPC_SERVER_ADDRESS:
    process.env.WA_GRPC_SERVER_ADDRESS || 'localhost:8088',
  JWT_SECRET_KEY: process.env.SECRET_HASH_KEY,
  MEDIA_UPLOAD_PATH: process.env.MEDIA_UPLOAD_PATH || '../../media_storage',
};

const config = { ...defaultConfig };

export default config;
