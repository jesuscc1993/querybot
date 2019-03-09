import { Guild, Message } from 'discord.js';

import { DiscordBot } from './discord-bot';

export type DiscordBotLogger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (error: Error | string) => void;
};

export type DiscordBotSettings = {
  botPrefix: string;
  botPrefixDefault?: string;
  botAuthToken: string;
  botCommands: { [name: string]: Function };
  onGuildJoined?: (discordBot: DiscordBot, guild: Guild) => void;
  onGuildLeft?: (discordBot: DiscordBot, guild: Guild) => void;
  onMention?: (discordBot: DiscordBot, message: Message) => void;
  logger: DiscordBotLogger;
  maximumGuildBotsPercentage?: number;
  minimumGuildMembersForFarmCheck?: number;
};
