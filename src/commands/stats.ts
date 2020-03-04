import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';

import { botColor } from '../settings';
import { getDateTime } from '../domain';

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
