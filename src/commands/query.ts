import { Message, TextChannel } from 'discord.js';
import { Logger } from 'winston';

import { DiscordBot } from '../discord-bot';
import { GoogleSearchResultItem } from '../providers/google-search/google-search.models';
import { ServerProvider } from '../providers/server/server.provider';
import { OutputUtil } from '../utils/output.util';

export const query = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  const queryParameters: string[] = input.split(' ');
  if (queryParameters.length >= 2) {
    let keyword: string | undefined = queryParameters.splice(0, 1)[0];
    const search: string = queryParameters.join(' ');
    const nsfw: boolean = (<TextChannel>message.channel).nsfw;

    const genericSearch: boolean = keyword === 'search' || keyword === 's';
    if (genericSearch) {
      keyword = undefined;
    }

    ServerProvider.getInstance()
      .search(message.guild.id, search, nsfw, keyword)
      .subscribe(
        searchResultItems => {
          if (!searchResultItems.length) {
            discordBot.sendMessage(message, `No results found.`);
          } else {
            discordBot.sendMessage(message, `This is what I found:`);

            searchResultItems.forEach((searchResultItem: GoogleSearchResultItem) => {
              discordBot.sendMessage(message, searchResultItem.link);
              // discordBot.sendMessage(message, undefined, getEmbedFromGoogleSearchResultItem(discordBot, searchResultItem));
            });
          }
        },
        error => {
          OutputUtil.outputError(discordBot.logger as Logger, error, `App.serverProvider.search`, message.guild.id, search, nsfw, keyword);
          discordBot.sendError(message, error);
        },
      );
  } else if (queryParameters.length >= 1 && queryParameters[0].replace(/!/g, '') !== '') {
    discordBot.onWrongParameterCount(message);
  }
};

/*const getEmbedFromGoogleSearchResultItem: Function = (discordBot: DiscordBot, searchResultItem: GoogleSearchResultItem): MessageOptions => {
  let description: string = '';
  description += `[${searchResultItem.title}](${discordBot.encodeUrl(searchResultItem.link)})\n`;
  description += `${searchResultItem.snippet}\n`;

  let image: any = {};
  if (searchResultItem.pagemap.cse_image && searchResultItem.pagemap.cse_image.length) {
    image.url = searchResultItem.pagemap.cse_image[0].src;
  }

  return {
    embed: {
      color: botColor,
      description: description,
      image: image
    }
  };

};*/
