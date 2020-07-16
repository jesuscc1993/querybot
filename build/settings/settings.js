"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var env = process.env;
exports.botPrefixDefault = env.botPrefixDefault || '!';
exports.botPrefix = env.botPrefix || exports.botPrefixDefault + "qb";
exports.botName = env.botName || 'QueryBot';
exports.botColor = env.botColor ? parseInt(env.botColor, 10) : 7506394;
exports.botAuthToken = env.botAuthToken || 'FILL_ME';
exports.logLevel = env.logLevel || 'info';
exports.logPath = env.logPath || 'logs';
exports.databaseUrl = env.databaseUrl || 'FILL_ME';
exports.databaseName = env.databaseName || 'FILL_ME';
exports.googleSearchApiKey = env.googleSearchApiKey || 'FILL_ME';
exports.googleSearchCx = env.googleSearchCx || 'FILL_ME';
exports.minimumGuildMembersForFarmCheck = env.minimumGuildMembersForFarmCheck
    ? parseInt(env.minimumGuildMembersForFarmCheck, 10)
    : 25;
exports.maximumGuildBotsPercentage = env.maximumGuildBotsPercentage
    ? parseInt(env.maximumGuildBotsPercentage, 10)
    : 75;
exports.defaultSiteKeywordsMap = env.defaultSiteKeywordsMap
    ? JSON.parse(env.defaultSiteKeywordsMap)
    : { yt: 'youtube.com', tw: 'twitch.tv' };
