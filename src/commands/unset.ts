import { Message } from 'discord.js';

import { outputError } from '../domain';
import { DiscordBot } from '../modules/discord-bot';
import { ServerProvider } from '../providers';

export const unsetSiteKeyword = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  if (parameters.length >= 1) {
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
