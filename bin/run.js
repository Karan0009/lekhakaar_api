import app from '../app/server.js';
import config from '../app/config/config.js';
import { LoggerFactory } from '../app/lib/logger.js';
import WhatsAppWebBot from '../app/lib/wa-web-util.js';

const logger = new LoggerFactory('expense-manager-api').logger;

app.listen(config.PORT, null, null, () => {
  logger.info(`server started on host: http://127.0.0.1:${config.PORT}`);
});

try {
  const waWebBot = new WhatsAppWebBot();
} catch (error) {
  logger.error(`error in running wa web bot`, { error });
}

logger.info(`wa web bot started`);
