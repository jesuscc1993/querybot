import { Message, TextChannel } from 'discord.js';

import { outputError } from '../domain';
import { DiscordBot } from '../modules/discord-bot';
import { GoogleSearchResultItem, ServerProvider } from '../providers';
import { botPrefix, botPrefixDefault } from '../settings';

export const query = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  const keywordSearch: boolean = !input.includes(botPrefix);
  const keyword = keywordSearch ? input.split(' ')[0].substring(botPrefixDefault.length) : undefined;

  if (parameters.length) {
    const search: string = parameters.join(' ');
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
          outputError(discordBot.logger, error, `ServerProvider.getInstance().search`, [
            message.guild.id,
            search,
            nsfw,
            keyword,
          ]);
          discordBot.sendError(message, error);
        },
      );
  } else if (!keywordSearch) {
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
