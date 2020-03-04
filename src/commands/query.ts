import { DiscordBot, DiscordBotCommandMetadata } from 'discord-bot';
import { Message, TextChannel } from 'discord.js';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { outputError } from '../domain';
import { GoogleSearchResultItem, ServerProvider } from '../providers';
import { botPrefix, botPrefixDefault } from '../settings';

export const query = (
  discordBot: DiscordBot,
  message: Message,
  input: string,
  parameters: string[],
  metadata: DiscordBotCommandMetadata,
) => {
  const commandCount = message.content
    .split('\n')
    .reduce((count, line) => count + (lineContainsPrefix(line, botPrefixDefault) ? 1 : 0), 0);

  if (commandCount > 1) {
    if (metadata.commandIndex === 0) {
      discordBot.sendError(message, 'Search command is restricted to one usage per message.');
    }

    return;
  }

  const keywordSearch: boolean = !input.includes(`${botPrefix} `);
  const keyword = keywordSearch ? input.split(' ')[0].substring(botPrefixDefault.length) : undefined;

  if ((!keywordSearch || keyword) && parameters.length) {
    const search: string = parameters.join(' ');
    const nsfw: boolean = (<TextChannel>message.channel).nsfw;

    const { guild } = message;
    if (guild) {
      ServerProvider.getInstance()
        .search(guild.id, search, nsfw, keyword)
        .pipe(
          tap(searchResultItems => {
            const messageText = `This is what I found:`;

            if (!searchResultItems.length) {
              discordBot.sendMessage(message, `No results found.`);
            } else if (searchResultItems.length === 1) {
              discordBot.sendMessage(message, `${messageText}\n${searchResultItems[0].link}`);
            } else {
              discordBot.sendMessage(message, `${messageText}`);

              searchResultItems.forEach((searchResultItem: GoogleSearchResultItem) => {
                discordBot.sendMessage(message, searchResultItem.link);
                // discordBot.sendMessage(message, undefined, getEmbedFromGoogleSearchResultItem(discordBot, searchResultItem));
              });
            }
          }),
          catchError(error => {
            outputError(discordBot.logger, error, `ServerProvider.getInstance().search`, [
              guild.id,
              search,
              nsfw,
              keyword,
            ]);
            return of(discordBot.sendError(message, error));
          }),
        )
        .subscribe();
    }
  } else if (!keywordSearch) {
    discordBot.onWrongParameterCount(message);
  }
};

const lineContainsPrefix = (line: string, prefix: string): boolean => {
  return line.indexOf(prefix) === 0 && line.substring(prefix.length + 1).charAt(0) !== ' ';
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
