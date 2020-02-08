import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';

import { outputError } from '../domain';
import { ServerProvider } from '../providers';
import { botPrefix } from '../settings';

export const unsetSiteKeyword = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  if (parameters.length >= 1) {
    if (!message.member?.hasPermission('ADMINISTRATOR')) {
      discordBot.sendError(message, `\`\`${botPrefix} unset\`\` command is restricted to administrators.`);
      return;
    }

    const { guild } = message;
    if (guild) {
      const keyword: string = parameters[0];
      ServerProvider.getInstance()
        .unsetSiteKeyword(guild.id, keyword)
        .subscribe(
          () => {
            discordBot.sendMessage(message, `Successfully unset keyword "${keyword}".`);
          },
          error => {
            outputError(discordBot.logger, error, `ServerProvider.getInstance().unsetSiteKeyword`, [guild.id, keyword]);
            discordBot.sendError(message, error);
          },
        );
    }
  } else {
    discordBot.onWrongParameterCount(message);
  }
};
