import { Message } from 'discord.js';

import { DiscordBot } from '../modules/discord-bot';
import { botColor, botName } from '../settings';

export const displayAbout = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  discordBot.sendMessage(message, undefined, {
    embed: {
      color: botColor,
      title: `About ${botName}:`,
      description: `**Description:**
        Searches the web for user provided queries. Keywords can be set and used to restrict results to certain sites.
        
        **Author:**
        [jesuscc1993](https://github.com/jesuscc1993/)
        
        **Official site (please, upvote if you like the bot):**
        [Official site](https://discordbots.org/bot/495279079868596225/)`,
    },
  });
};
