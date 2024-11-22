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
  MAX_RAW_TRANSACTIONS_LIMIT: 20,
};

const config = { ...defaultConfig };

export default config;
