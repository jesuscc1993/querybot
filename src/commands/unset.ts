import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { outputError } from '../domain';
import { ServerProvider } from '../providers';
import { botPrefix } from '../settings';

export const unsetSiteKeyword = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  if (parameters.length >= 1) {
    const { guild, member } = message;

    if (!member?.permissions.has('MANAGE_GUILD')) {
      discordBot.sendError(message, `\`\`${botPrefix} unset\`\` command requires the "Manage Server" permission.`);
      return;
    }

    if (guild) {
      const [keyword] = parameters;

      ServerProvider.getInstance()
        .unsetSiteKeyword(guild.id, keyword)
        .pipe(
          tap(() => {
            discordBot.sendMessage(message, `Successfully unset keyword "${keyword}".`);
          }),
          catchError((error) => {
            outputError(discordBot.logger, error, `ServerProvider.getInstance().unsetSiteKeyword`, [guild.id, keyword]);
            return of(discordBot.sendError(message, error));
          }),
        )
        .subscribe();
    }
  } else {
    discordBot.onWrongParameterCount(message);
  }
};
