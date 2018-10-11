import { Message } from 'discord.js';
import { DiscordBot } from '../discord-bot';
import { botColor, botPrefix } from '../settings/settings';

export const displayHelp = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  discordBot.sendMessage(message, undefined, {
    embed: {
      color: botColor,
      title: 'Available commands:',
      fields: [
        {
          name: `\`${botPrefix}about\``,
          value: `Displays information about the bot.`
        },
        {
          name: `\`${botPrefix}help, ${botPrefix}?\``,
          value: `Displays the bot's help.`
        },
        {
          name: `\`${botPrefix}list, ${botPrefix}ls\``,
          value: `Displays all available keywords.`
        },
        {
          name: `\`${botPrefix}set {keyword} {siteUrl}\``,
          value: `Sets a site url to a keyword. Example: \`${botPrefix}set yt youtube.com\`.`
        },
        {
          name: `\`${botPrefix}unset {keyword}\``,
          value: `Unsets a site keyword. Example: \`${botPrefix}unset yt\`.`
        },
        {
          name: `\`${botPrefix}{keyword} {query}\``,
          value: `Returns the first search result matching a query on the site corresponding to a keyword. Example: \`${botPrefix}yt GMM\`.`
        },
        {
          name: `\`${botPrefix}search {query}\`, \`${botPrefix}s {query}\``,
          value: `Returns the first search result matching a query on any site. Example: \`${botPrefix}search discord bots\`.`
        }
      ]
    }
  });
};