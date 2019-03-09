import { Message, TextChannel } from 'discord.js';

import { outputError } from '../domain';
import { DiscordBot } from '../modules/discord-bot';
import { GoogleSearchResultItem, ServerProvider } from '../providers';

export const query = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  const queryParameters: string[] = input.split(' ');
  let keyword: string | undefined = queryParameters.splice(0, 1)[0];

  const genericSearch: boolean = keyword === 'search' || keyword === 's';
  if (genericSearch) {
    keyword = undefined;
  }

  if (queryParameters.length >= 1) {
    const search: string = queryParameters.join(' ');
    const nsfw: boolean = (<TextChannel>message.channel).nsfw;

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
          outputError(discordBot.logger, error, `App.serverProvider.search`, message.guild.id, search, nsfw, keyword);
          discordBot.sendError(message, error);
        },
      );
  } else if (genericSearch) {
    discordBot.onWrongParameterCount(message);
  }
};

/*const getEmbedFromGoogleSearchResultItem = (discordBot: DiscordBot, searchResultItem: GoogleSearchResultItem): MessageOptions => {
  let description: string = '';
  description += `[${searchResultItem.title}](${encodeUrl(searchResultItem.link)})\n`;
  description += `${searchResultItem.snippet}\n`;

  let image: { url?: string } = {};
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

};

const encodeUrl = (url: string) => url.replace(/\(/g, '%28').replace(/\)/g, '%29');*/
