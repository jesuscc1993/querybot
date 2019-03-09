import { Guild, Message, TextChannel } from 'discord.js';
import { Observable } from 'rxjs';

import { displayAbout, displayHelp, listSites, query, setSiteKeyword, unsetSiteKeyword } from '../../commands';
import { outputError } from '../../domain';
import { ServerProvider } from '../../providers';
import {
  botAuthToken,
  botPrefix,
  databaseName,
  databaseUrl,
  googleSearchApiKey,
  googleSearchCx,
  maximumGuildBotsPercentage,
  minimumGuildMembersForFarmCheck,
} from '../../settings';
import { DiscordBot, DiscordBotLogger } from '../discord-bot';

export class QueryBot {
  private className: string;
  private logger: DiscordBotLogger;

  private discordBot: DiscordBot;
  private serverProvider: ServerProvider;

  constructor(logger: DiscordBotLogger) {
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
    return this.serverProvider.connect(databaseUrl, databaseName);
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

  private onMention(discordBot: DiscordBot, message: Message) {
    discordBot.sendMessage(message, `Do you need something from me?\nYou can see my commands by sending the message \`${botPrefix}help\`.`);
  }

  private onGuildJoined(discordBot: DiscordBot, guild: Guild) {
    const systemChannel: TextChannel = discordBot.getClient().channels.get(guild.systemChannelID) as TextChannel;
    if (systemChannel) {
      systemChannel.send(`Thanks for inviting me.\nIf you need anything, you can see my commands by sending the message \`${botPrefix}help\`.`);
    }
  }

  private onGuildLeft(discordBot: DiscordBot, guild: Guild) {
    this.serverProvider.deleteServerById(guild.id).subscribe(
      () => {
        this.logger.info(`${this.className}: Deleted database entry for guild ${guild.id} ("${guild.name}")`);
      },
      error => this.onError(error, `onGuildLeft`),
    );
  }

  private onError(error: Error | string, functionName: string) {
    outputError(this.logger, error, `${this.className}.${functionName}`);
  }
}
