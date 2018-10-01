import { Observable, Observer } from 'rxjs';
import { Client, Guild, GuildMember, Message, TextChannel } from 'discord.js';

import { SiteKeyword } from './models/site-keyword';

import { ServerProvider } from './providers/server/server.provider';
import { GoogleSearchResultItem } from './providers/google-search/google-search.models';

import { botAuthToken, botColor, botPrefix, databaseName, databaseUrl, googleSearchApiKey, googleSearchCx } from './settings/settings';

const Discord = require('discord.js');

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
    this.queryBot = new Discord.Client();

    this.queryBot.login(botAuthToken).then();

    this.queryBot.on('ready', () => {
      this.setActivityMessage();

      this.queryBot.guilds.forEach((guild: Guild) => this.leaveGuildWhenSuspectedAsBotFarm(guild));
    });

    this.queryBot.on('guildCreate', (guild: Guild) => this.onGuildUpdate(guild));
    this.queryBot.on('guildMemberAdd', (guild: Guild) => this.onGuildUpdate(guild));
    this.queryBot.on('guildMemberRemove', (guild: Guild) => this.onGuildUpdate(guild));

    this.queryBot.on('message', (message: Message) => {
      if (message.content.substring(0, botPrefix.length) === botPrefix) {
        let input: string = message.content.substring(botPrefix.length);
        const command: string = input.split(' ')[0];
        const parameters: string[] = this.getParametersFromInput(input);

        const serverId: string = message.guild.id;

        switch (command) {
          case 'help':
            this.displayHelp(message);
            break;
          case '?':
            this.displayHelp(message);
            break;
          case 'list':
            this.listSites(message, parameters);
            break;
          case 'ls':
            this.listSites(message, parameters);
            break;
          case 'set':
            this.setKeyword(message, parameters);
            break;
          default:
            this.query(message, input);
            break;
        }
      }
    });
  }

  private onGuildUpdate(guild: Guild): void {
    this.leaveGuildWhenSuspectedAsBotFarm(guild);
    this.setActivityMessage();
  }

  private leaveGuildWhenSuspectedAsBotFarm(guild: Guild) {
    const minimumMembersCheck: number = 25;
    let botCount: number = 0;

    guild.members.forEach((member: GuildMember) => {
      if (member.user.bot) botCount++;
    });

    if (guild.members.size > 25 && botCount * 100 / guild.members.size >= 75) {
      guild.leave().then();
    }
  }

  private setActivityMessage() {
    this.queryBot.user.setActivity(`${botPrefix}help | ${this.queryBot.guilds.size} servers`, { type: 'LISTENING' }).then();
  }

  private getParametersFromInput(input: string): string[] {
    const parameters: string[] = input.split(' ');
    parameters.splice(0, 1);
    return parameters;
  }

  private displayHelp(message: Message): void {
    message.channel.send(undefined, {
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
    }).then();
  }

  private listSites(message: Message, parameters: string[]): void {
    if (parameters.length === 0) {

      this.sitesProvider.getServerSiteKeywords(message.guild.id).subscribe((siteKeywords: SiteKeyword[]) => {
        if (siteKeywords.length) {
          let list: string = '';
          siteKeywords.forEach((site) => {
            list += `• **${site.keyword}** (${site.url})\n`;
          });
          list = list.substring(0, list.length - 1); // remove last line break

          message.channel.send(undefined, {
            embed: {
              color: botColor,
              title: 'Available keywords',
              description: `${list}`
            }
          }).then();

        } else {
          message.channel.send(`No keywords available. Use command \`${botPrefix}help\` to see how to add one.`).then();
        }
      });

    } else {
      this.onWrongParameterCount(message);
    }
  }

  private setKeyword(message: Message, parameters: string[]): void {
    if (parameters.length === 2) {
      const keyword: string = parameters[0];
      const site: string = parameters[1];
      this.sitesProvider.addSiteKeyword(message.guild.id, keyword, site).subscribe((site) => {
        message.channel.send(`Successfully set site **${site}** to keyword **${keyword}**.`).then();
      });

    } else {
      this.onWrongParameterCount(message);
    }
  }

  private query(message: Message, input: string): void {
    const parameters: string[] = input.split(' ');
    if (parameters.length >= 2) {
      const keyword: string = parameters.splice(0, 1)[0];
      const search: string = parameters.join(' ');

      const genericSearch: boolean = keyword === 'search' || keyword === 's';

      this.sitesProvider.search(message.guild.id, search, (<TextChannel> message.channel).nsfw, genericSearch ? undefined : keyword).subscribe((searchResultItems: GoogleSearchResultItem[]) => {
        if (searchResultItems.length === 1) {
          message.channel.send(searchResultItems[0].link).then();

        } else {
          let description: string = '';
          searchResultItems.forEach((searchResultItem: GoogleSearchResultItem) => {
            description += `• [${searchResultItem.title}](${this.encodeUrl(searchResultItem.link)})\n`;
          });
          description = description.substring(0, description.length - 1); // remove last line break

          message.channel.send(undefined, {
            embed: {
              color: botColor,
              title: `This is what I found:`,
              description: description
            }
          }).then();

        }
      }, (error: Error) => {
        message.channel.send(error.message || `My apologies. I had some trouble processing your request.`).then();
      });

    } else {
      this.onWrongParameterCount(message);
    }
  }

  private onWrongParameterCount(message: Message): void {
    message.channel.send(`Invalid parameter count`).then();
  }

  private encodeUrl(url: string): string {
    return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

}

new App().initialize();