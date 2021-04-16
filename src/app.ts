import { DiscordBotLogger } from 'discord-bot';
import winston, { format } from 'winston';

import { getDate, setupEventHandlers } from './domain';
import { QueryBot } from './modules/core';
import { logLevel, logPath } from './settings';

const logger: DiscordBotLogger = <DiscordBotLogger>winston.createLogger({
  format: format.combine(
    format.label({ label: '[my-label]' }),
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`),
  ),
  level: logLevel,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${logPath}/querybot-${getDate()}.log` }),
  ],
});

setupEventHandlers(logger);

new QueryBot(logger);
