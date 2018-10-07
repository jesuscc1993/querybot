import { Observable } from 'rxjs';
import { Message, TextChannel } from 'discord.js';
import * as _ from 'lodash';

import { ServerProvider } from './providers/server/server.provider';
import { GoogleSearchResultItem } from './providers/google-search/google-search.models';

import {
  botAuthToken,
  botColor,
  botPrefix,
  databaseName,
  databaseUrl,
  googleSearchApiKey,
  googleSearchCx,
  maximumGuildBotsPercentage,
  minimumGuildMembersForFarmCheck,
  outputEnabled
} from './settings/settings';
import { DiscordBot } from './discord-bot';

const Discord = require('discord.js');

export class App {
  private discordBot: DiscordBot;
  private sitesProvider: ServerProvider;

  public initialize(): void {
    this.setupHandlers();

    this.initializeDatabase().subscribe(() => {
      this.initializeBot();

    }, (error) => {
      this.onError(error, `App.initializeDatabase`);
    });
  }

  private setupHandlers() {
    const unhandledRejections: Map<Promise<any>, string> = new Map();
    process.on('exit', (exitCode: number) => {
      this.error(`Forced exit of code: ${exitCode}`);
    });
    process.on('unhandledRejection', (reason: string, promise: Promise<any>) => {
      unhandledRejections.set(promise, reason);
      this.error(`Unhandled rejection: ${promise} ${reason}`);
    });
    process.on('rejectionHandled', (promise: Promise<any>) => {
      unhandledRejections.delete(promise);
      this.error(`Rejection handled: ${promise}`);
    });
    process.on('uncaughtException', (error: Error) => {
      this.error(`Caught exception: ${error}`);
    });
    process.on('warning', (warning: any) => {
      this.error(`Process warning: ${warning.name}\nMessage: ${warning.message}\nStack trace:\n${warning.trace}`);
    });
  }

  private initializeDatabase(): Observable<undefined> {
    this.sitesProvider = new ServerProvider(googleSearchApiKey, googleSearchCx);

    return new Observable((observer) => {
      this.sitesProvider.connect(databaseUrl, databaseName).subscribe(() => {
        this.output(`Database connection successfully established`);

        observer.next(undefined);
        observer.complete();

      }, (error: Error) => {
        observer.error(error);
      });
    });
  }

  private initializeBot() {
    this.discordBot = new DiscordBot({
      botName: `QueryBot`,
      botPrefix: botPrefix,
      botAuthToken: botAuthToken,
      botCommands: {
        'help': (message: Message, input: string, parameters: string[]) => {
          this.displayHelp(message, input, parameters)
        },
        '?': (message: Message, input: string, parameters: string[]) => {
          this.displayHelp(message, input, parameters)
        },

        'list': (message: Message, input: string, parameters: string[]) => {
          this.listSites(message, input, parameters)
        },
        'ls': (message: Message, input: string, parameters: string[]) => {
          this.listSites(message, input, parameters)
        },

        'set': (message: Message, input: string, parameters: string[]) => {
          this.setKeyword(message, input, parameters)
        },

        'search': (message: Message, input: string, parameters: string[]) => {
          this.query(message, input, parameters)
        },
        'default': (message: Message, input: string, parameters: string[]) => {
          this.query(message, input, parameters)
        }
      },
      outputEnabled: outputEnabled,
      maximumGuildBotsPercentage: maximumGuildBotsPercentage,
      minimumGuildMembersForFarmCheck: minimumGuildMembersForFarmCheck
    });
  }

  private displayHelp(message: Message, input: string, parameters: string[]): void {
    this.discordBot.sendMessage(message, undefined, {
      embed: {
        color: botColor,
        title: 'QueryBot',
        description: 'Searches the web for user provided queries. Keywords can be set and used to restrict results to certain sites.',
        fields: [
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
  }

  private listSites(message: Message, input: string, parameters: string[]): void {
    if (parameters.length === 0) {

      this.sitesProvider.getServerSiteKeywords(message.guild.id).subscribe((siteKeywords) => {
        if (siteKeywords.length) {
          let list: string = '';
          _.orderBy(siteKeywords, 'keyword').forEach((site) => {
            list += `• **${site.keyword}** (${site.url})\n`;
          });
          list = list.substring(0, list.length - 1); // remove last line break

          this.discordBot.sendMessage(message, undefined, {
            embed: {
              color: botColor,
              title: 'Available keywords',
              description: `${list}`
            }
          });

        } else {
          this.discordBot.sendMessage(message, `No keywords available. Use command \`${botPrefix}help\` to see how to add one.`);
        }
      }, (error) => {
        this.onError(error, `App.sitesProvider.getServerSiteKeywords`, message.guild.id);
      });

    } else {
      this.discordBot.onWrongParameterCount(message);
    }
  }

  private setKeyword(message: Message, input: string, parameters: string[]): void {
    if (parameters.length === 2) {
      const keyword: string = parameters[0];
      const site: string = parameters[1];
      this.sitesProvider.addSiteKeyword(message.guild.id, keyword, site).subscribe((site) => {
        this.discordBot.sendMessage(message, `Successfully set site **${site}** to keyword **${keyword}**.`);

      }, (error) => {
        this.onError(error, `App.sitesProvider.addSiteKeyword`, message.guild.id, keyword, site);
      });

    } else {
      this.discordBot.onWrongParameterCount(message);
    }
  }

  private query(message: Message, input: string, parameters: string[]): void {
    const queryParameters: string[] = input.split(' ');
    if (queryParameters.length >= 2) {
      const keyword: string = queryParameters.splice(0, 1)[0];
      const search: string = queryParameters.join(' ');

      const genericSearch: boolean = keyword === 'search' || keyword === 's';

      this.sitesProvider.search(message.guild.id, search, (<TextChannel> message.channel).nsfw, genericSearch ? undefined : keyword).subscribe((searchResultItems) => {
        if (searchResultItems.length === 1) {
          this.discordBot.sendMessage(message, searchResultItems[0].link);

        } else {
          let description: string = '';
          searchResultItems.forEach((searchResultItem: GoogleSearchResultItem) => {
            description += `• [${searchResultItem.title}](${this.discordBot.encodeUrl(searchResultItem.link)})\n`;
          });
          description = description.substring(0, description.length - 1); // remove last line break

          this.discordBot.sendMessage(message, undefined, {
            embed: {
              color: botColor,
              title: `This is what I found:`,
              description: description
            }
          });

        }
      }, (error: Error) => {
        this.discordBot.sendMessage(message, error || `My apologies. I had some trouble processing your request.`);
      });

    } else if (queryParameters.length >= 1 && queryParameters[0].replace(/!/g, '') !== '') {
      this.discordBot.onWrongParameterCount(message);
    }
  }

  private onError(error: Error, functionName: string, ...parameters: any): Function {
    let errorMessage: string = `${error} thrown`;
    if (functionName) errorMessage += ` when calling ${functionName}`;
    if (parameters) errorMessage += ` with parameters ${parameters}`;

    return (error: Error) => {
      this.error(errorMessage);
    };
  }

  private output(message: string): void {
    console.log(`App: ${message}`);
  }

  private error(error: Error | any): void {
    console.error(`App: ${error}`);
  }

}

new App().initialize();