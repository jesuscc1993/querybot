import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';

import { getDateTime } from '../domain';
import { botColor } from '../settings';

export const displayStats = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  const statistics = [];

  const guildCount = discordBot.getGuilds().size;
  statistics.push([`Running on ${guildCount} servers`]);

  const { uptime } = discordBot.getClient();
  if (uptime) statistics.push(`Running since ${getDateTime(new Date(new Date().getTime() - uptime))} (server time)`);

  discordBot.sendMessage(message, undefined, {
    embed: {
      color: botColor,
      description: `**# Statistics:**\n${statistics.join(`\n`)}`,
    },
  });
};
