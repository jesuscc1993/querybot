import { Client, Guild, GuildMember, Message, MessageOptions, StringResolvable } from 'discord.js';

const Discord = require('discord.js');

export class DiscordBotSettings {
  botName: string;
  botPrefix: string;
  botAuthToken: string;
  botCommands: any;
  outputEnabled?: boolean;
  maximumGuildBotsPercentage?: number;
  minimumGuildMembersForFarmCheck?: number;
}

export class DiscordBot {
  readonly botName: string;
  readonly botPrefix: string;
  readonly botAuthToken: string;
  readonly botCommands: any;
  readonly outputEnabled: boolean | undefined;
  readonly maximumGuildBotsPercentage: number | undefined;
  readonly minimumGuildMembersForFarmCheck: number | undefined;

  private client: Client;

  constructor(discordBotSettings: DiscordBotSettings) {
    this.botName = discordBotSettings.botName;
    this.botPrefix = discordBotSettings.botPrefix;
    this.botAuthToken = discordBotSettings.botAuthToken;
    this.botCommands = discordBotSettings.botCommands;
    this.outputEnabled = discordBotSettings.outputEnabled;
    this.maximumGuildBotsPercentage = discordBotSettings.maximumGuildBotsPercentage;
    this.minimumGuildMembersForFarmCheck = discordBotSettings.minimumGuildMembersForFarmCheck;
    this.initializeBot();
  }

  private initializeBot() {
    this.client = new Discord.Client();

    this.client.login(this.botAuthToken).then(this.noop, (error: Error) => this.onError(error, `client.login`));

    this.client.on('error', (error) => this.onError(error, `client.on('error'`));

    this.client.on('ready', () => {
      this.setActivityMessage();

      let guildIdentifications: string[] = [];
      this.client.guilds.forEach((guild: Guild) => {
        const leftGuild: boolean = this.leaveGuildWhenSuspectedAsBotFarm(guild);
        if (!leftGuild) {
          guildIdentifications.push(`(${guild.id}) "${guild.name}"`);
        }
      });

      if (guildIdentifications.length) {
        this.output(`Currently running on the following ${guildIdentifications.length} server(s):\n${guildIdentifications.sort().join('\n')}`);
      }
    });

    this.client.on('guildCreate', (guild: Guild) => {
      this.output(`Joined server "${guild.name}"`);
      this.onGuildUpdate(guild);
    });
    this.client.on('guildMemberAdd', (guild: Guild) => this.onGuildUpdate(guild));
    this.client.on('guildMemberRemove', (guild: Guild) => this.onGuildUpdate(guild));
    this.client.on('guildDelete', (guild: Guild) => this.output(`Left server "${guild.name}"`));

    this.client.on('message', (message: Message) => {
      if (this.isBotCommand(message)) {
        const input: string = message.content.substring(this.botPrefix.length);
        const command: string = input.split(' ')[0];
        const parameters: string[] = this.getParametersFromInput(input);
        (this.botCommands[command] || this.botCommands.default)(message, input, parameters);
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

  private isBotCommand(message: Message): boolean {
    return message.content.substring(0, this.botPrefix.length) === this.botPrefix;
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
    console.log(`${this.botName}: ${message}`);
  }

  private error(error: Error | any): void {
    console.error(`${this.botName}: ${error}`);
  }

  private noop(): void {

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

  public encodeUrl(url: string): string {
    return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

}