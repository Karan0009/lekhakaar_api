import app from '../app/server.js';
import config from '../app/config/config.js';
import { LoggerFactory } from '../app/lib/logger.js';

const logger = new LoggerFactory('expense-manager-api').logger;

app.listen(config.PORT, null, null, () => {
  logger.info(`server started on host: http://127.0.0.1:${config.PORT}`);
});
