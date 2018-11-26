import { Guild, Message, TextChannel } from 'discord.js';
import { Observable } from 'rxjs';
import { Logger } from 'winston';

import { displayAbout } from './commands/about';
import { displayHelp } from './commands/help';
import { listSites } from './commands/list';
import { query } from './commands/query';
import { setSiteKeyword } from './commands/set';
import { unsetSiteKeyword } from './commands/unset';
import { DiscordBot } from './discord-bot';
import { ServerProvider } from './providers/server/server.provider';
import {
  botAuthToken,
  botPrefix,
  databaseName,
  databaseUrl,
  googleSearchApiKey,
  googleSearchCx,
  maximumGuildBotsPercentage,
  minimumGuildMembersForFarmCheck,
} from './settings/settings';
import { OutputUtil } from './utils/output.util';

export class QueryBot {
  private className: string;
  private logger: Logger;

  private discordBot: DiscordBot;
  private serverProvider: ServerProvider;

  constructor(logger: Logger) {
    this.className = `QueryBot`;

    this.logger = logger;

    this.serverProvider = ServerProvider.getInstance();
    this.serverProvider.configure(googleSearchApiKey, googleSearchCx);

    this.initializeDatabase().subscribe(
      () => {
        this.logger.info(`${this.className}: Database connection successfully established`);
        this.initializeBot();
      },
      error => this.onError(error, `initializeDatabase`),
    );
  }

  private initializeDatabase(): Observable<undefined> {
    return this.serverProvider.connect(
      databaseUrl,
      databaseName,
    );
  }

  private initializeBot() {
    this.discordBot = new DiscordBot({
      botPrefix: botPrefix,
      botAuthToken: botAuthToken,
      botCommands: {
        about: displayAbout.bind(this),
        help: displayHelp.bind(this),
        '?': displayHelp.bind(this),
        list: listSites.bind(this),
        ls: listSites.bind(this),
        set: setSiteKeyword.bind(this),
        unset: unsetSiteKeyword.bind(this),
        search: query.bind(this),
        default: query.bind(this),
      },
      onMention: this.onMention.bind(this),
      onGuildJoined: this.onGuildJoined.bind(this),
      onGuildLeft: this.onGuildLeft.bind(this),
      logger: this.logger,
      maximumGuildBotsPercentage: maximumGuildBotsPercentage,
      minimumGuildMembersForFarmCheck: minimumGuildMembersForFarmCheck,
    });
  }

  private onMention(discordBot: DiscordBot, message: Message): void {
    discordBot.sendMessage(message, `Do you need something from me?\nYou can see my commands by sending the message \`${botPrefix}help\`.`);
  }

  private onGuildJoined(discordBot: DiscordBot, guild: Guild): void {
    const systemChannel: TextChannel = discordBot.getClient().channels.get(guild.systemChannelID) as TextChannel;
    if (systemChannel) {
      systemChannel.send(`Thanks for inviting me.\nIf you need anything, you can see my commands by sending the message \`${botPrefix}help\`.`);
    }
  }

  private onGuildLeft(discordBot: DiscordBot, guild: Guild): void {
    this.serverProvider.deleteServerById(guild.id).subscribe(
      () => {
        this.logger.info(`${this.className}: Deleted database entry for guild ${guild.id} ("${guild.name}")`);
      },
      error => this.onError(error, `onGuildLeft`),
    );
  }

  private onError(error: Error, functionName: string): void {
    OutputUtil.outputError(this.logger, error, `${this.className}.${functionName}`);
  }
}
