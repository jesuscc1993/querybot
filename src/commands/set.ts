import { DiscordBot } from 'discord-bot';
import { Message } from 'discord.js';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { outputError } from '../domain';
import { ServerProvider } from '../providers';
import { botPrefix } from '../settings';

export const setSiteKeyword = (discordBot: DiscordBot, message: Message, input: string, parameters: string[]) => {
  if (parameters.length >= 2) {
    const { guild, member } = message;

    if (!member?.hasPermission('MANAGE_GUILD')) {
      discordBot.sendError(message, `\`\`${botPrefix} set\`\` command requires the "Manage Server" permission.`);
      return;
    }

    if (guild) {
      const [keyword, site] = parameters;

      ServerProvider.getInstance()
        .setSiteKeyword(guild.id, keyword, site)
        .pipe(
          tap(() => {
            discordBot.sendMessage(message, `Successfully set site "${site}" to keyword "${keyword}".`);
          }),
          catchError((error) => {
            outputError(discordBot.logger, error, `ServerProvider.getInstance().setSiteKeyword`, [
              guild.id,
              keyword,
              site,
            ]);
            return of(discordBot.sendError(message, error));
          }),
        )
        .subscribe();
    }
  } else {
    discordBot.onWrongParameterCount(message);
  }
};
