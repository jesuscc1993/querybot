import {
  DiscordBot,
  DiscordBotCommandMetadata,
  DiscordBotLogger,
} from 'discord-bot';
import { ActivityOptions, Guild, Message, TextChannel } from 'discord.js';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  displayAbout,
  displayHelp,
  displayStats,
  listSites,
  query,
  setSiteKeyword,
  unsetSiteKeyword,
} from '../../commands';
import { outputError } from '../../domain';
import { ServerProvider } from '../../providers';
import {
  botAuthToken,
  botPrefix,
  botPrefixDefault,
  databaseName,
  databaseUrl,
  googleSearchApiKey,
  googleSearchCx,
  maximumGuildBotsPercentage,
  minimumGuildMembersForFarmCheck,
} from '../../settings';

export class QueryBot {
  private className: string;
  private logger: DiscordBotLogger;

  private discordBot: DiscordBot;
  private serverProvider: ServerProvider;

  constructor(logger: DiscordBotLogger) {
    this.className = `QueryBot`;

    this.logger = logger;

    this.serverProvider = ServerProvider.getInstance();
    this.serverProvider
      .configure(googleSearchApiKey, googleSearchCx)
      .connect(databaseUrl, databaseName)
      .pipe(
        tap(() => {
          this.initializeBot();
          this.logger.info(`${this.className}: Database connection successfully established`);
        }),
        catchError(error => {
          return of(this.onError(error, `constructor`));
        }),
      )
      .subscribe();
  }

  private initializeBot() {
    this.discordBot = new DiscordBot({
      botAuthToken,
      botCommands: {
        '?': this.mapCommand(displayHelp),
        about: this.mapCommand(displayAbout),
        default: this.mapCommand(query),
        help: this.mapCommand(displayHelp),
        list: this.mapCommand(listSites),
        ls: this.mapCommand(listSites),
        s: this.mapCommand(query),
        search: this.mapCommand(query),
        set: this.mapCommand(setSiteKeyword),
        stats: this.mapCommand(displayStats),
        unset: this.mapCommand(unsetSiteKeyword),
      },
      botPrefix,
      botPrefixDefault,
      logger: this.logger,
      maximumGuildBotsPercentage,
      minimumGuildMembersForFarmCheck,
      onGuildJoined: this.onGuildJoined.bind(this),
      onGuildLeft: this.onGuildLeft.bind(this),
      onLoad: this.onLoad.bind(this),
      onMention: this.onMention.bind(this),
    });
  }

  private logGuildCount() {
    const guildCount = this.discordBot.getGuilds().size;
    this.logger.info(`${this.className}: Currently running on ${guildCount} servers`);
  }

  private mapCommand(
    command: (
      discordBot: DiscordBot,
      message: Message,
      input: string,
      parameters: string[],
      metadata: DiscordBotCommandMetadata,
    ) => void,
  ) {
    return (message: Message, input: string, parameters: string[], metadata: DiscordBotCommandMetadata) => {
      command(this.discordBot, message, input, parameters, metadata);
    };
  }

  private onError(error: Error | string, functionName: string) {
    return outputError(this.logger, error, `${this.className}.${functionName}`);
  }

  private onGuildJoined(guild: Guild) {
    const systemChannel: TextChannel = guild.systemChannel as TextChannel;
    if (systemChannel) {
      systemChannel.send(
        `Thanks for inviting me.\nIf you need anything, you can see my commands by sending the message \`${botPrefix} help\`.`,
      );
    }
    this.logGuildCount();
  }

  private onGuildLeft(guild: Guild) {
    this.serverProvider
      .deleteServerById(guild.id)
      .pipe(
        tap(() => {
          this.logger.info(`${this.className}: Deleted database entry for guild ${guild.id} ("${guild.name}")`);
        }),
        catchError(error => of(this.onError(error, `onGuildLeft`))),
      )
      .subscribe();
    this.logGuildCount();
  }

  private onLoad() {
    this.setActivityMessage(`${botPrefix} help`, { type: 'LISTENING' });
    this.logGuildCount();
  }

  private onMention(message: Message) {
    this.discordBot.sendMessage(
      message,
      `Do you need something from me?\nYou can see my commands by sending the message \`${botPrefix} help\`.`,
    );
  }

  private setActivityMessage(activityMessage: string, activityOptions: ActivityOptions) {
    this.discordBot.setActivityMessage(activityMessage, activityOptions);
  }
}
