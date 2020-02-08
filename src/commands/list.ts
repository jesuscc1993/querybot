import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';

import { outputError } from '../domain';
import { ServerProvider } from '../providers';
import { botColor, botPrefix } from '../settings';

export const listSites = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  const { guild } = message;
  if (guild) {
    ServerProvider.getInstance()
      .getServerSiteKeywords(guild.id)
      .subscribe(
        siteKeywords => {
          if (siteKeywords.length) {
            let list: string = '';
            siteKeywords
              .sort((a, b) => (a.keyword > b.keyword ? 1 : -1))
              .forEach(site => {
                list += `• **${site.keyword}** (${site.url})\n`;
              });
            list = list.substring(0, list.length - 1); // remove last line break

            discordBot.sendMessage(message, undefined, {
              embed: {
                color: botColor,
                title: 'Available keywords',
                description: `${list}`,
              },
            });
          } else {
            discordBot.sendMessage(
              message,
              `No keywords available. Use command \`${botPrefix} help\` to see how to add one.`,
            );
          }
        },
        error => {
          outputError(discordBot.logger, error, `ServerProvider.getInstance().getServerSiteKeywords`, [guild.id]);
          discordBot.sendError(message, error);
        },
      );
  }
};
