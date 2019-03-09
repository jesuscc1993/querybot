import winston, { Logger } from 'winston';

import { QueryBot } from './query-bot';
import { logLevel, logPath } from './settings/settings';
import { EventsUtil } from './utils/events.util';

const logger: Logger = winston.createLogger({
  format: winston.format.simple(),
  level: logLevel,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${logPath}/querybot-${new Date().toISOString().split('T')[0]}.log` }),
  ],
});

EventsUtil.setupHandlers(logger);

new QueryBot(logger);
