import { Observable } from 'rxjs';

import { DiscordBot } from './discord-bot';
import { ServerProvider } from './providers/server/server.provider';

import { OutputUtil } from './utils/output.util';
import { EventsUtil } from './utils/events.util';

import {
  botAuthToken,
  botName,
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

export class App {
  private discordBot: DiscordBot;
  private serverProvider: ServerProvider;

  public initialize(): void {
    OutputUtil.configure(outputEnabled);
    EventsUtil.setupHandlers();

    this.initializeDatabase().subscribe(() => {
      this.initializeBot();

    }, (error) => {
      OutputUtil.outputError(error, `App.initializeDatabase`);
    });
  }

  private initializeDatabase(): Observable<undefined> {
    this.serverProvider = ServerProvider.getInstance();
    this.serverProvider.configure(googleSearchApiKey, googleSearchCx);

    return new Observable((observer) => {
      this.serverProvider.connect(databaseUrl, databaseName).subscribe(() => {
        OutputUtil.output(`Database connection successfully established`);

        observer.next(undefined);
        observer.complete();

      }, (error: Error) => {
        observer.error(error);
      });
    });
  }

  private initializeBot() {
    this.discordBot = new DiscordBot({
      botPrefix: botPrefix,
      botName: botName,
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
      outputEnabled: outputEnabled,
      maximumGuildBotsPercentage: maximumGuildBotsPercentage,
      minimumGuildMembersForFarmCheck: minimumGuildMembersForFarmCheck
    });
  }

}

new App().initialize();