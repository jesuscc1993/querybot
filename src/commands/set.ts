import { Message } from 'discord.js';

import { outputError } from '../domain';
import { DiscordBot } from '../modules/discord-bot';
import { ServerProvider } from '../providers';

export const setSiteKeyword = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  if (parameters.length === 2) {
    const keyword: string = parameters[0];
    const site: string = parameters[1];
    ServerProvider.getInstance()
      .setSiteKeyword(message.guild.id, keyword, site)
      .subscribe(
        () => {
          discordBot.sendMessage(message, `Successfully set site "${site}" to keyword "${keyword}".`);
        },
        error => {
          outputError(discordBot.logger, error, `App.sitesProvider.setSiteKeyword`, message.guild.id, keyword, site);
          discordBot.sendError(message, error);
        },
      );
  } else {
    discordBot.onWrongParameterCount(message);
  }
};
