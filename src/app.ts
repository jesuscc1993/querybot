import { Observable, Observer } from 'rxjs';
import { Client } from 'discord.io';

import { SiteKeyword } from './models/site-keyword';

import { ServerProvider } from './providers/server/server.provider';
import { GoogleSearchResultItem } from './providers/google-search/google-search.models';

import { botAuthToken, botColor, botPrefix, databaseName, databaseUrl, googleSearchApiKey, googleSearchCx } from './settings/settings';

const Discord = require('discord.io');

export class App {

  private queryBot: Client;
  private sitesProvider: ServerProvider;

  public initialize(): void {
    this.sitesProvider = new ServerProvider(googleSearchApiKey, googleSearchCx);

    this.initializeDatabase().subscribe(() => {
      this.initializeBot();
    });
  }

  private initializeDatabase(): Observable<undefined> {
    return new Observable((observer: Observer<undefined>) => {
      this.sitesProvider.connect(databaseUrl, databaseName).subscribe(() => {
        console.log(`Database connection successfully established`);

        observer.next(undefined);
        observer.complete();

      }, (error: Error) => {
        observer.error(error);
      });
    });
  }

  private initializeBot() {
    this.queryBot = new Discord.Client({
      token: botAuthToken,
      autorun: true
    });

    this.queryBot.on('ready', (event: any) => {

    });

    this.queryBot.on('message', (user: string, userID: string, channelID: string, message: string, event: any) => {
      if (message.substring(0, botPrefix.length) === botPrefix) {
        let input: string = message.substring(botPrefix.length);
        const command: string = input.split(' ')[0];
        const parameters: string[] = this.getParametersFromInput(input);

        const serverId: string = event.d.guild_id;

        switch (command) {
          case 'help':
            this.displayHelp(channelID);
            break;
          case '?':
            this.displayHelp(channelID);
            break;
          case 'list':
            this.listSites(channelID, serverId, parameters);
            break;
          case 'ls':
            this.listSites(channelID, serverId, parameters);
            break;
          case 'set':
            this.setKeyword(channelID, serverId, parameters);
            break;
          default:
            this.query(channelID, serverId, input);
            break;
        }
      }
    });
  }

  private getParametersFromInput(input: string): string[] {
    const parameters: string[] = input.split(' ');
    parameters.splice(0, 1);
    return parameters;
  }

  private displayHelp(channelID: string): void {
    this.queryBot.sendMessage({
      to: channelID,
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

  private listSites(channelID: string, serverId: string, parameters: string[]): void {
    if (parameters.length === 0) {

      this.sitesProvider.getServerSiteKeywords(serverId).subscribe((siteKeywords: SiteKeyword[]) => {
        if (siteKeywords.length) {
          let list: string = '';
          siteKeywords.forEach((site) => {
            list += `• **${site.keyword}** (${site.url})\n`;
          });
          list = list.substring(0, list.length - 1); // remove last line break

          this.queryBot.sendMessage({
            to: channelID,
            embed: {
              color: botColor,
              title: 'Available keywords',
              description: `${list}`
            }
          });

        } else {
          this.queryBot.sendMessage({
            to: channelID,
            message: `No keywords available. Use command \`${botPrefix}help\` to see how to add one.`
          });
        }
      });

    } else {
      this.onWrongParameterCount(channelID);
    }
  }

  private setKeyword(channelID: string, serverId: string, parameters: string[]): void {
    if (parameters.length === 2) {
      const keyword: string = parameters[0];
      const site: string = parameters[1];
      this.sitesProvider.addSiteKeyword(serverId, keyword, site).subscribe((site) => {
        this.queryBot.sendMessage({
          to: channelID,
          message: `Successfully set site **${site}** to keyword **${keyword}**.`
        });
      });

    } else {
      this.onWrongParameterCount(channelID);
    }
  }

  private query(channelID: string, serverId: string, input: string): void {
    const parameters: string[] = input.split(' ');
    if (parameters.length >= 2) {
      const keyword: string = parameters.splice(0, 1)[0];
      const search: string = parameters.join(' ');

      const genericSearch: boolean = keyword === 'search' || keyword === 's';

      this.sitesProvider.search(serverId, search, genericSearch ? undefined : keyword).subscribe((searchResultItems: GoogleSearchResultItem[]) => {
        if (searchResultItems.length === 1) {
          this.queryBot.sendMessage({
            to: channelID,
            message: searchResultItems[0].link
          });

        } else {
          let description: string = '';
          searchResultItems.forEach((searchResultItem: GoogleSearchResultItem) => {
            description += `• [${searchResultItem.title}](${this.encodeUrl(searchResultItem.link)})\n`;
          });
          description = description.substring(0, description.length - 1); // remove last line break

          this.queryBot.sendMessage({
            to: channelID,
            embed: {
              color: botColor,
              title: `This is what I found:`,
              description: description
            }
          });

        }
      }, (error: Error) => {
        console.error(`ERROR: ${error.message}`);

        this.queryBot.sendMessage({
          to: channelID,
          message: error.message || `My apologies. I had some trouble processing your request.`
        });
      });

    } else {
      this.onWrongParameterCount(channelID);
    }
  }

  private onWrongParameterCount(channelID: string): void {
    this.queryBot.sendMessage({
      to: channelID,
      message: `Invalid parameter count`
    });
  }

  private encodeUrl(url: string): string {
    return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

}

new App().initialize();