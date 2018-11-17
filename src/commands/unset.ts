import { Message } from 'discord.js';
import { Logger } from 'winston';
import * as _ from 'lodash';

import { DiscordBot } from '../discord-bot';
import { ServerProvider } from '../providers/server/server.provider';
import { OutputUtil } from '../utils/output.util';

export const unsetSiteKeyword = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  if (parameters.length === 1) {
    const keyword: string = parameters[0];
    ServerProvider.getInstance().unsetSiteKeyword(message.guild.id, keyword).subscribe(() => {
      discordBot.sendMessage(message, `Successfully unset keyword "${keyword}".`);

    }, (error) => {
      OutputUtil.outputError(discordBot.logger as Logger, error, `App.sitesProvider.unsetSiteKeyword`, message.guild.id, keyword);
      discordBot.sendError(message, error);
    });

  } else {
    discordBot.onWrongParameterCount(message);
  }
};