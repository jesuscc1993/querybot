import { Message, TextChannel } from 'discord.js';
import { DiscordBot } from '../discord-bot';
import { ServerProvider } from '../providers/server/server.provider';
import { OutputUtil } from '../utils/output.util';
import { GoogleSearchResultItem } from '../providers/google-search/google-search.models';
import { botColor } from '../settings/settings';

export const query = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  const queryParameters: string[] = input.split(' ');
  if (queryParameters.length >= 2) {
    let keyword: string | undefined = queryParameters.splice(0, 1)[0];
    const search: string = queryParameters.join(' ');
    const nsfw: boolean = (<TextChannel> message.channel).nsfw;

    const genericSearch: boolean = keyword === 'search' || keyword === 's';
    if (genericSearch) {
      keyword = undefined;
    }

    ServerProvider.getInstance().search(message.guild.id, search, nsfw, keyword).subscribe((searchResultItems) => {
      if (!searchResultItems.length) {
        discordBot.sendMessage(message, `No results found.`);

      } else if (searchResultItems.length === 1) {
        discordBot.sendMessage(message, searchResultItems[0].link);

      } else if (searchResultItems.length > 1) {
        let description: string = '';
        searchResultItems.forEach((searchResultItem: GoogleSearchResultItem) => {
          description += `• [${searchResultItem.title}](${discordBot.encodeUrl(searchResultItem.link)})\n`;
        });
        description = description.substring(0, description.length - 1); // remove last line break

        discordBot.sendMessage(message, undefined, {
          embed: {
            color: botColor,
            title: `This is what I found:`,
            description: description
          }
        });

      }
    }, (error) => {
      OutputUtil.outputError(error, `App.serverProvider.search`, message.guild.id, search, nsfw, keyword);
      discordBot.sendError(message, error);
    });

  } else if (queryParameters.length >= 1 && queryParameters[0].replace(/!/g, '') !== '') {
    discordBot.onWrongParameterCount(message);
  }
};