const { env } = process;
import dotenv from 'dotenv';

dotenv.config();

export const botPrefixDefault = env.botPrefixDefault || '!';
export const botPrefix = env.botPrefix || `${botPrefixDefault}qb`;
export const botName = env.botName || 'QueryBot';
export const botColor = env.botColor ? parseInt(env.botColor, 10) : 7506394;
export const botAuthToken = env.botAuthToken || 'FILL_ME';
export const logLevel = env.logLevel || 'info';
export const logPath = env.logPath || 'logs';
export const databaseUrl = env.databaseUrl || 'FILL_ME';
export const databaseName = env.databaseName || 'FILL_ME';
export const googleSearchApiKey = env.googleSearchApiKey || 'FILL_ME';
export const googleSearchCx = env.googleSearchCx || 'FILL_ME';

export const minimumGuildMembersForFarmCheck = env.minimumGuildMembersForFarmCheck
  ? parseInt(env.minimumGuildMembersForFarmCheck, 10)
  : 25;

export const maximumGuildBotsPercentage = env.maximumGuildBotsPercentage
  ? parseInt(env.maximumGuildBotsPercentage, 10)
  : 75;

export const defaultSiteKeywordsMap = env.defaultSiteKeywordsMap
  ? JSON.parse(env.defaultSiteKeywordsMap)
  : { yt: 'youtube.com', tw: 'twitch.tv' };
