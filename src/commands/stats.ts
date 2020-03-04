import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';

import { getDateTime } from '../domain';
import { botColor } from '../settings';

export const displayStats = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  const client = discordBot.getClient();
  const guildCount = client.guilds.cache.size;

  const statistics = [`Running on ${guildCount} servers`];
  if (client.uptime)
    statistics.push(`Running since ${getDateTime(new Date(new Date().getTime() - client.uptime))} (server time)`);

  discordBot.sendMessage(message, undefined, {
    embed: {
      color: botColor,
      description: `**# Statistics:**\n${statistics.join(`\n`)}`,
    },
  });
};
