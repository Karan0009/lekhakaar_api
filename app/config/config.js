import dotenv from 'dotenv';
dotenv.config({
  override: true,
});
const defaultConfig = {
  APP_NAME: process.env.APP_NAME || 'expense-manager',
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
  MAX_RAW_TRANSACTIONS_LIMIT: 100,
  BULL_UI_PATH: '/bullui',
  BULL_MQ_QUEUES: {
    testSeriesQuestionsQueue: 'test-series-questions-queue',
    testSeriesQuestionsBatchesQueue: 'test-series-questions-batches-queue',
  },
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  TEST_SERIES_QUESTIONS_JOB_BATCH_SIZE: 2,
  TEST_SERIES_QUESTIONS_BATCHES_JOB_BATCH_SIZE: 3,
  times: {
    mins_30_in_ms: 1800000,
  },
};

const config = { ...defaultConfig };

export default config;
