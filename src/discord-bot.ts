import { Client, Guild, GuildMember, Message, MessageOptions, StringResolvable } from 'discord.js';

const Discord = require('discord.js');

export interface DiscordBotSettings {
  botPrefix: string;
  botAuthToken: string;
  botCommands: any;
  onGuildJoined?: Function;
  onGuildLeft?: Function;
  onMention?: Function;
  outputEnabled?: boolean;
  maximumGuildBotsPercentage?: number;
  minimumGuildMembersForFarmCheck?: number;
}

export class DiscordBot {
  readonly botPrefix: string;
  readonly botAuthToken: string;
  readonly botCommands: any;
  readonly onGuildJoined?: Function | undefined;
  readonly onGuildLeft?: Function | undefined;
  readonly onMention?: Function | undefined;
  readonly outputEnabled: boolean | undefined;
  readonly maximumGuildBotsPercentage: number | undefined;
  readonly minimumGuildMembersForFarmCheck: number | undefined;

  private className: string;
  private client: Client;

  constructor(discordBotSettings: DiscordBotSettings) {
    this.botPrefix = discordBotSettings.botPrefix;
    this.botAuthToken = discordBotSettings.botAuthToken;
    this.botCommands = discordBotSettings.botCommands;
    this.onGuildJoined = discordBotSettings.onGuildJoined;
    this.onGuildLeft = discordBotSettings.onGuildLeft;
    this.onMention = discordBotSettings.onMention;
    this.outputEnabled = discordBotSettings.outputEnabled;
    this.maximumGuildBotsPercentage = discordBotSettings.maximumGuildBotsPercentage;
    this.minimumGuildMembersForFarmCheck = discordBotSettings.minimumGuildMembersForFarmCheck;
    this.initializeBot();
  }

  private initializeBot() {
    this.className = `DiscordBot`;

    this.client = new Discord.Client();

    this.client.login(this.botAuthToken).then(this.noop, (error: Error) => this.onError(error, `client.login`));

    this.client.on('error', (error) => this.onError(error, `client.on('error'`));

    this.client.on('ready', () => {
      this.setActivityMessage();

      let guildIdentifications: string[] = [];
      this.client.guilds.forEach((guild: Guild) => {
        const leftGuild: boolean = this.leaveGuildWhenSuspectedAsBotFarm(guild);
        if (!leftGuild) {
          guildIdentifications.push(`${guild.id} ("${guild.name}")`);
        }
      });

      if (guildIdentifications.length) {
        this.output(`Currently running on the following ${guildIdentifications.length} server(s):\n${guildIdentifications.sort().join('\n')}`);
      }
    });

    this.client.on('guildCreate', (guild: Guild) => {
      this.output(`Joined guild "${guild.name}"`);
      this.onGuildUpdate(guild);
      this.call(this.onGuildJoined, this, guild);
    });
    this.client.on('guildMemberAdd', (guild: Guild) => this.onGuildUpdate(guild));
    this.client.on('guildMemberRemove', (guild: Guild) => this.onGuildUpdate(guild));
    this.client.on('guildDelete', (guild: Guild) => {
      this.output(`Left guild "${guild.name}"`);
      this.call(this.onGuildLeft, this, guild);
    });

    this.client.on('message', (message: Message) => {
      const commandFound: boolean = message.content.indexOf(this.botPrefix) === 0 || message.content.indexOf(`\n${this.botPrefix}`) > 0;

      if (commandFound) {
        message.content.split('\n').forEach((line) => {
          if (this.isBotCommand(line)) {
            const input: string = line.substring(this.botPrefix.length);
            const command: string = input.split(' ')[0];
            const parameters: string[] = this.getParametersFromInput(input);
            (this.botCommands[command] || this.botCommands.default)(this, message, input, parameters);
          }
        });

      } else if (message.isMentioned(this.client.user)) {
        this.call(this.onMention, this, message);
      }

    });
  }

  private onGuildUpdate(guild: Guild): void {
    this.leaveGuildWhenSuspectedAsBotFarm(guild);
    this.setActivityMessage();
  }

  private leaveGuildWhenSuspectedAsBotFarm(guild: Guild): boolean {
    if (guild.members && this.minimumGuildMembersForFarmCheck && this.maximumGuildBotsPercentage) {
      let botCount: number = 0;

      guild.members.forEach((member: GuildMember) => {
        if (member.user.bot) botCount++;
      });

      if (guild.members.size > this.minimumGuildMembersForFarmCheck && botCount * 100 / guild.members.size >= this.maximumGuildBotsPercentage) {
        guild.leave().then(this.noop, (error: Error) => {
          this.onError(error, 'guild.leave');
        });
        this.output(`Server "${guild.name}" has been marked as potential bot farm`);
        return true;
      }
    }

    return false;
  }

  private setActivityMessage() {
    const activityMessage: string = `${this.botPrefix}help | ${this.client.guilds.size} servers`;
    const activityOptions: any = { type: 'LISTENING' };
    this.client.user.setActivity(activityMessage, activityOptions).then(this.noop, (error: Error) => {
      this.onError(error, 'client.user.setActivity', activityMessage, JSON.stringify(activityOptions));
    });
  }

  private isBotCommand(text: string): boolean {
    return text.substring(0, this.botPrefix.length) === this.botPrefix && text.substring(this.botPrefix.length).charAt(0) !== ' ';
  }

  private getParametersFromInput(input: string): string[] {
    const parameters: string[] = input.split(' ');
    parameters.splice(0, 1);
    return parameters;
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
    if (this.outputEnabled) {
      console.log(`${this.className}: ${message}`);
    }
  }

  private error(error: Error | any): void {
    console.error(`${this.className}: ${error}`);
  }

  private noop(...params: any): void {

  }

  private call(method: Function | undefined, ...params: any): void {
    const finalMethod = typeof method === 'function' ? method : this.noop;
    finalMethod(...params);
  }

  /* public */

  public onWrongParameterCount(message: Message): void {
    this.sendMessage(message, `Invalid parameter count`);
  }

  public sendMessage(message: Message, messageContent: StringResolvable, messageOptions?: MessageOptions): void {
    if (message.guild.me.permissions.has('SEND_MESSAGES')) {
      message.channel.send(messageContent, messageOptions).then(this.noop, (error) => {
        this.onError(error, 'message.channel.send', messageContent, JSON.stringify(messageOptions));
      });
    } else {
      message.author.send(`I don't have the permission to send messages on the server "${message.guild.name}". Please, contact the server admin to have this permission added.`);
    }
  }

  public sendError(message: Message, error: Error): void {
    const errorMessage: string = error ? error.message : '';
    this.sendMessage(message, errorMessage || `My apologies. I had some trouble processing your request.`);
  }

  public encodeUrl(url: string): string {
    return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

}