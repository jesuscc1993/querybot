import { Message } from 'discord.js';
import { DiscordBot } from '../discord-bot';
import { ServerProvider } from '../providers/server/server.provider';
import { OutputUtil } from '../utils/output.util';
import { botColor, botPrefix } from '../settings/settings';
import * as _ from 'lodash';

export const listSites = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  if (parameters.length === 0) {

    ServerProvider.getInstance().getServerSiteKeywords(message.guild.id).subscribe((siteKeywords) => {
      if (siteKeywords.length) {
        let list: string = '';
        _.orderBy(siteKeywords, 'keyword').forEach((site) => {
          list += `• **${site.keyword}** (${site.url})\n`;
        });
        list = list.substring(0, list.length - 1); // remove last line break

        discordBot.sendMessage(message, undefined, {
          embed: {
            color: botColor,
            title: 'Available keywords',
            description: `${list}`
          }
        });

      } else {
        discordBot.sendMessage(message, `No keywords available. Use command \`${botPrefix}help\` to see how to add one.`);
      }
    }, (error) => {
      OutputUtil.outputError(error, `App.sitesProvider.getServerSiteKeywords`, message.guild.id);
      discordBot.sendError(message, error);
    });

  } else {
    discordBot.onWrongParameterCount(message);
  }
};