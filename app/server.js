import express from 'express';
import cors from 'cors';
import router from './routes/router.js';
import sequelize from './lib/sequelize.js';
import { LoggerFactory } from './lib/logger.js';
import { createNamespace } from 'cls-hooked';
import config from './config/config.js';
import setRequestId from './middlewares/set_request_id.js';
import { join } from 'node:path';

cors({
  origin: '*',
});
const __dirname = import.meta.dirname;
const app = express();
const logger = new LoggerFactory('server.js').logger;
createNamespace(`${config.APP_NAME}-req-context`);

app.use(express.json());
app.use(setRequestId);
app.use('/static', express.static(join(__dirname, '../uploads')));
app.use(router);

(async () => {
  try {
    await sequelize.authenticate();
    // const sql = await sequelize.sync({ alter: true });
  } catch (error) {
    logger.error('Unable to connect to the database', { error });
  }
})();

export default app;
