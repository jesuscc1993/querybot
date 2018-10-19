import { Observable } from 'rxjs';
import { Guild, Message } from 'discord.js';

import { DiscordBot } from './discord-bot';
import { ServerProvider } from './providers/server/server.provider';

import { OutputUtil } from './utils/output.util';

import {
  botAuthToken,
  botPrefix,
  databaseName,
  databaseUrl,
  googleSearchApiKey,
  googleSearchCx,
  maximumGuildBotsPercentage,
  minimumGuildMembersForFarmCheck,
  outputEnabled
} from './settings/settings';

import { displayHelp } from './commands/help';
import { displayAbout } from './commands/about';
import { listSites } from './commands/list';
import { setSiteKeyword } from './commands/set';
import { unsetSiteKeyword } from './commands/unset';
import { query } from './commands/query';

const Discord = require('discord.js');

export class QueryBot {
  private className: string;

  private discordBot: DiscordBot;
  private serverProvider: ServerProvider;

  public initialize() {
    this.className = `QueryBot`;

    this.serverProvider = ServerProvider.getInstance();
    this.serverProvider.configure(googleSearchApiKey, googleSearchCx);

    this.initializeDatabase().subscribe(() => {
      OutputUtil.log(`${this.className}: Database connection successfully established`);
      this.initializeBot();

    }, (error) => this.onError(error, `initializeDatabase`));
  }

  private initializeDatabase(): Observable<undefined> {
    return this.serverProvider.connect(databaseUrl, databaseName);
  }

  private initializeBot() {
    this.discordBot = new DiscordBot({
      botPrefix: botPrefix,
      botAuthToken: botAuthToken,
      botCommands: {
        'about': displayAbout.bind(this),
        'help': displayHelp.bind(this),
        '?': displayHelp.bind(this),
        'list': listSites.bind(this),
        'ls': listSites.bind(this),
        'set': setSiteKeyword.bind(this),
        'unset': unsetSiteKeyword.bind(this),
        'search': query.bind(this),
        'default': query.bind(this)
      },
      onMention: this.onMention.bind(this),
      onGuildLeft: this.onGuildLeft.bind(this),
      outputEnabled: outputEnabled,
      maximumGuildBotsPercentage: maximumGuildBotsPercentage,
      minimumGuildMembersForFarmCheck: minimumGuildMembersForFarmCheck
    });
  }

  private onMention(discordBot: DiscordBot, message: Message): void {
    discordBot.sendMessage(message, `Do you need something from me?\nYou can see my commands by sending the message \`${botPrefix}help\`.`);
  }

  private onGuildLeft(discordBot: DiscordBot, guild: Guild): void {
    this.serverProvider.deleteServerById(guild.id).subscribe(() => {
      OutputUtil.log(`${this.className}: Deleted database entry for guild ${guild.id} ("${guild.name}")`);

    }, (error) => this.onError(error, `onGuildLeft`));
  }

  private onError(error: Error, functionName: string): void {
    OutputUtil.outputError(error, `${this.className}.${functionName}`);
  }

}