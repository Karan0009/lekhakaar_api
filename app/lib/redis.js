import Redis from 'ioredis';
import config from '../config/config.js';
import { LoggerFactory } from './logger.js';

const logger = new LoggerFactory('redis').logger;

logger.info('redis db', { ...config.REDIS, process: process.env.REDIS_DB });
const redis = new Redis({
  port: config.REDIS.port,
  host: config.REDIS.host,
  username: config.REDIS.username,
  password: config.REDIS.password,
  db: config.REDIS.db,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  logger.info('connected to redis');
});

redis.on('close', () => {
  logger.info('redis connection closed');
});

redis.on('error', (err) => {
  logger.error('error in connectiong to redis', { error: err });
});

export default redis;

// export default class RedisClient {
//   constructor() {
//     this.client = new Redis({
//       port: config.REDIS.port,
//       host: config.REDIS.host,
//       username: config.REDIS.username,
//       password: config.REDIS.password,
//       db: config.REDIS.db,
//     });
//   }
//   async set(key, value) {
//     return this.client.set(key, value);
//   }

//   async get(key) {
//     return this.client.get(key);
//   }

//   async del(key) {
//     return this.client.del(key);
//   }
// }
