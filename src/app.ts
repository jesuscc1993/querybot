import moment from 'moment';
import winston, { Logger } from 'winston';

import { QueryBot } from './query-bot';
import { EventsUtil } from './utils/events.util';
import { logLevel, logPath } from './settings/settings';

const logger: Logger = winston.createLogger({
    format: winston.format.simple(),
    level: logLevel,
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: `${logPath}/querybot-${moment.utc(new Date()).format('YYYY-MM-DD')}.log` })
    ]
  });

EventsUtil.setupHandlers(logger);

new QueryBot(logger);