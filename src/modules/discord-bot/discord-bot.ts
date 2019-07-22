import Discord, {
  ActivityType,
  Client,
  Guild,
  GuildMember,
  Message,
  MessageOptions,
  PermissionResolvable,
  StringResolvable,
} from 'discord.js';
import { noop } from 'rxjs';

import { execute, getParametersFromLine, lineContainsPrefix, messageContainsPrefix } from './discord-bot.domain';
import { DiscordBotSettings } from './discord-bot.types';

export class DiscordBot {
  readonly botPrefix: DiscordBotSettings['botPrefix'];
  readonly botPrefixDefault: DiscordBotSettings['botPrefixDefault'];
  readonly botAuthToken: DiscordBotSettings['botAuthToken'];
  readonly botCommands: DiscordBotSettings['botCommands'];
  readonly onGuildJoined?: DiscordBotSettings['onGuildJoined'];
  readonly onGuildLeft?: DiscordBotSettings['onGuildLeft'];
  readonly onMention?: DiscordBotSettings['onMention'];
  readonly logger: DiscordBotSettings['logger'];
  readonly maximumGuildBotsPercentage?: DiscordBotSettings['maximumGuildBotsPercentage'];
  readonly minimumGuildMembersForFarmCheck?: DiscordBotSettings['minimumGuildMembersForFarmCheck'];

  private client: Client;

  constructor(discordBotSettings: DiscordBotSettings) {
    Object.assign(this, discordBotSettings);

    this.client = new Discord.Client();

    this.client.login(this.botAuthToken).then(noop, this.onError(`client.login`));

    this.client.on('error', this.onError(`client.on('error'`));

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
        this.log(
          `Currently running on the following ${
            guildIdentifications.length
          } server(s):\n  ${guildIdentifications.sort().join('\n  ')}`,
        );
      }
    });

    this.client.on('guildCreate', (guild: Guild) => {
      this.log(`Joined guild "${guild.name}"`);
      this.onGuildUpdate(guild);
      execute(this.onGuildJoined, this, guild);
    });
    this.client.on('guildMemberAdd', (guild: Guild) => this.onGuildUpdate(guild));
    this.client.on('guildMemberRemove', (guild: Guild) => this.onGuildUpdate(guild));
    this.client.on('guildDelete', (guild: Guild) => {
      this.log(`Left guild "${guild.name}"`);
      execute(this.onGuildLeft, this, guild);
    });

    this.client.on('message', (message: Message) => {
      if (
        messageContainsPrefix(message.content, this.botPrefix) ||
        (this.botPrefixDefault && messageContainsPrefix(message.content, this.botPrefixDefault))
      ) {
        message.content.split('\n').forEach(line => {
          if (lineContainsPrefix(line, `${this.botPrefix} `)) {
            const command: string = line.substring(this.botPrefix.length + 1).split(' ')[0];
            const parsedLine = line.substring(this.botPrefix.length + 1 + command.length);
            execute(this.botCommands[command], this, message, line, getParametersFromLine(parsedLine));
          } else if (
            this.botCommands.default &&
            this.botPrefixDefault &&
            lineContainsPrefix(line, this.botPrefixDefault)
          ) {
            this.botCommands.default(this, message, line, getParametersFromLine(line));
          }
        });
      } else if (message.isMentioned(this.client.user)) {
        execute(this.onMention, this, message);
      }
    });
  }

  public getClient(): Client {
    return this.client;
  }

  private onGuildUpdate(guild: Guild) {
    this.leaveGuildWhenSuspectedAsBotFarm(guild);
    this.setActivityMessage();
  }

  private leaveGuildWhenSuspectedAsBotFarm(guild: Guild): boolean {
    if (guild.members && this.minimumGuildMembersForFarmCheck && this.maximumGuildBotsPercentage) {
      let botCount: number = 0;

      guild.members.forEach((member: GuildMember) => {
        if (member.user.bot) botCount++;
      });

      if (
        guild.members.size > this.minimumGuildMembersForFarmCheck &&
        (botCount * 100) / guild.members.size >= this.maximumGuildBotsPercentage
      ) {
        guild.leave().then(noop, this.onError('guild.leave'));
        this.log(`Server "${guild.name}" has been marked as potential bot farm`);
        return true;
      }
    }

    return false;
  }

  private setActivityMessage() {
    const activityMessage: string = `${this.botPrefix} help | ${this.client.guilds.size} servers`;
    const activityOptions: { type: ActivityType } = { type: 'LISTENING' };
    this.client.user
      .setActivity(activityMessage, activityOptions)
      .then(noop, this.onError('client.user.setActivity', [activityMessage, JSON.stringify(activityOptions)]));
  }

  private onError(functionName: string, parameters?: Array<string | number | boolean | undefined>) {
    return (error: Error | string) => {
      let errorMessage: string = `${error} thrown`;
      if (functionName) errorMessage += ` when calling ${functionName}`;
      if (parameters) errorMessage += ` with parameters: ${parameters.join(', ')}`;
      this.error(`${errorMessage}.`);
    };
  }

  private log(message: string) {
    this.logger.info(message);
  }

  private error(error: Error | string) {
    this.logger.error(error);
  }

  /* public */

  public onWrongParameterCount(message: Message) {
    this.sendMessage(message, `Invalid parameter count.`);
  }

  public sendMessage(message: Message, messageContent: StringResolvable, messageOptions?: MessageOptions) {
    if (message.guild.me.permissions.has('SEND_MESSAGES')) {
      message.channel.send(messageContent, messageOptions).then(noop, error => {
        this.onError(error, ['message.channel.send', messageContent, JSON.stringify(messageOptions)]);
      });
    } else {
      message.author.send(
        `I don't have the permission to send messages on the server "${
          message.guild.name
        }". Please, contact the server admin to have this permission added.`,
      );
    }
  }

  public sendError(message: Message, error: Error | string) {
    const errorMessage: string = (<Error>error).message || <string>error;
    this.sendMessage(message, undefined, {
      embed: {
        description: `**Error:** ${errorMessage || 'My apologies. I had some trouble processing your request.'}`,
        color: 15158332,
      },
    });
  }

  public hasPermission({ permissions }: GuildMember, permission: PermissionResolvable, checkAdmin?: boolean) {
    return permissions.has(permission, checkAdmin);
  }
}
