import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';

import { botColor } from '../settings';

export const displayAbout = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  discordBot.sendMessage(message, undefined, {
    embeds: [
      {
        color: botColor,
        description: `**# Description:**
        Searches the web for user provided queries. Keywords can be set and used to restrict results to certain sites.
        
        **# Author**
        [jesuscc1993](https://github.com/jesuscc1993/)
        
        **# Official site**
        Feel free to upvote if you want to 😉
        [discordbots.org](https://discordbots.org/bot/495279079868596225)`,
      },
    ],
  });
};
