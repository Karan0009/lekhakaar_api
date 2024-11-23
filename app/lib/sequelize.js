import { Sequelize } from 'sequelize';
import config from '../config/config.js';
import { LoggerFactory } from './logger.js';

const { username, password, database, host, dialect, ssl } = config.PG_DATABASE;

const logger = new LoggerFactory('sequelize').logger;
const __dirname = import.meta.dirname;

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
  dialectOptions: {
    ssl: ssl,
  },
  benchmark: true,
  timezone: '+00:00',
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  },
  logging: (query, timing) => {
    logger.info(`${query}, duration: ${timing}ms`);
  },
  hooks: {
    afterConnect: (connection, sqlConfig) => {
      logger.info('db connected', {
        database: sqlConfig.database,
        port: sqlConfig.port,
        username: sqlConfig.username,
      });
    },
    afterInit: () => {
      logger.info('Sequelize started!');
    },
    afterDisconnect: () => {
      logger.info('db disconnected');
    },
    afterDestroy: () => {
      logger.info('db destroyed');
    },
  },
});

export default sequelize;
