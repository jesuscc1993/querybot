import moment from 'moment';
import winston, { Logger } from 'winston';

import { QueryBot } from './query-bot';
import { logLevel, logPath } from './settings/settings';
import { EventsUtil } from './utils/events.util';

const logger: Logger = winston.createLogger({
  format: winston.format.simple(),
  level: logLevel,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${logPath}/querybot-${moment.utc(new Date()).format('YYYY-MM-DD')}.log` }),
  ],
});

EventsUtil.setupHandlers(logger);

new QueryBot(logger);
