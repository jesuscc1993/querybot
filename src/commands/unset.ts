import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';

import { outputError } from '../domain';
import { ServerProvider } from '../providers';
import { botPrefix } from '../settings';

export const unsetSiteKeyword = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  if (parameters.length >= 1) {
    if (!discordBot.hasPermission(message.member, 'ADMINISTRATOR')) {
      discordBot.sendError(message, `\`\`${botPrefix} unset\`\` command is restricted to administrators.`);
      return;
    }

    const keyword: string = parameters[0];
    ServerProvider.getInstance()
      .unsetSiteKeyword(message.guild.id, keyword)
      .subscribe(
        () => {
          discordBot.sendMessage(message, `Successfully unset keyword "${keyword}".`);
        },
        error => {
          outputError(discordBot.logger, error, `ServerProvider.getInstance().unsetSiteKeyword`, [
            message.guild.id,
            keyword,
          ]);
          discordBot.sendError(message, error);
        },
      );
  } else {
    discordBot.onWrongParameterCount(message);
  }
};
