import { Message } from 'discord.js';
import { Logger } from 'winston';

import { DiscordBot } from '../discord-bot';
import { ServerProvider } from '../providers/server/server.provider';
import { OutputUtil } from '../utils/output.util';

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
          OutputUtil.outputError(discordBot.logger as Logger, error, `App.sitesProvider.setSiteKeyword`, message.guild.id, keyword, site);
          discordBot.sendError(message, error);
        },
      );
  } else {
    discordBot.onWrongParameterCount(message);
  }
};
