import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';

import { botColor, botPrefix, botPrefixDefault } from '../settings';

export const displayHelp = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  discordBot.sendMessage(message, undefined, {
    embed: {
      color: botColor,
      description: `**# Commands:**

      **\`${botPrefix} about\`**
      Displays information about the bot.
      
      **\`${botPrefix} help\`, \`${botPrefix} ?\`**
      Displays the bot's help.
      
      **\`${botPrefix} list\`, \`${botPrefix} ls\`**
      Displays all available keywords.
      
      **\`${botPrefix} set {keyword} {siteUrl}\`**
      Sets a site url to a keyword. Example: \`${botPrefix} set yt youtube.com\`.
      
      **\`${botPrefix} unset {keyword}\`**
      Unsets a site keyword. Example: \`${botPrefix} unset yt\`.
      
      **\`${botPrefix} search {query}\`, \`${botPrefix} s {query}\`**
      Returns the first search result matching a query on any site. Example: \`${botPrefix} search discord bots\`.
      
      **\`${botPrefixDefault}{keyword} {query}\`**
      Returns the first search result matching a query on the site corresponding to a keyword. Example: \`${botPrefixDefault}yt GMM\`.
      
      **# Issues and suggestions:**      
      Got an issue or suggestion? You can report them here:
      [github.com](https://github.com/jesuscc1993/querybot/issues)
      `,
    },
  });
};
