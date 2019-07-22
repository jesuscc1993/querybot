import { DiscordBotLogger } from 'discord-bot/dist/discord-bot.types';
import winston from 'winston';

import { setupEventHandlers } from './domain';
import { QueryBot } from './modules/core';
import { logLevel, logPath } from './settings';

const logger: DiscordBotLogger = <DiscordBotLogger>winston.createLogger({
  format: winston.format.simple(),
  level: logLevel,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${logPath}/querybot-${new Date().toISOString().split('T')[0]}.log` }),
  ],
});

setupEventHandlers(logger);

new QueryBot(logger);
