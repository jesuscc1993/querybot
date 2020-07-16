"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_bot_1 = require("discord-bot");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var commands_1 = require("../../commands");
var domain_1 = require("../../domain");
var providers_1 = require("../../providers");
var settings_1 = require("../../settings");
var QueryBot = /** @class */ (function () {
    function QueryBot(logger) {
        var _this = this;
        this.className = "QueryBot";
        this.logger = logger;
        this.serverProvider = providers_1.ServerProvider.getInstance();
        this.serverProvider
            .configure(settings_1.googleSearchApiKey, settings_1.googleSearchCx)
            .connect(settings_1.databaseUrl, settings_1.databaseName)
            .pipe(operators_1.tap(function () {
            _this.initializeBot();
            _this.logger.info(_this.className + ": Database connection successfully established");
        }), operators_1.catchError(function (error) {
            return rxjs_1.of(_this.onError(error, "constructor"));
        }))
            .subscribe();
    }
    QueryBot.prototype.initializeBot = function () {
        this.discordBot = new discord_bot_1.DiscordBot({
            botAuthToken: settings_1.botAuthToken,
            botCommands: {
                '?': this.mapCommand(commands_1.displayHelp),
                about: this.mapCommand(commands_1.displayAbout),
                default: this.mapCommand(commands_1.query),
                help: this.mapCommand(commands_1.displayHelp),
                list: this.mapCommand(commands_1.listSites),
                ls: this.mapCommand(commands_1.listSites),
                s: this.mapCommand(commands_1.query),
                search: this.mapCommand(commands_1.query),
                set: this.mapCommand(commands_1.setSiteKeyword),
                stats: this.mapCommand(commands_1.displayStats),
                unset: this.mapCommand(commands_1.unsetSiteKeyword),
            },
            botPrefix: settings_1.botPrefix,
            botPrefixDefault: settings_1.botPrefixDefault,
            logger: this.logger,
            maximumGuildBotsPercentage: settings_1.maximumGuildBotsPercentage,
            minimumGuildMembersForFarmCheck: settings_1.minimumGuildMembersForFarmCheck,
            onGuildJoined: this.onGuildJoined.bind(this),
            onGuildLeft: this.onGuildLeft.bind(this),
            onLoad: this.onLoad.bind(this),
            onMention: this.onMention.bind(this),
        });
    };
    QueryBot.prototype.logGuildCount = function () {
        var guildCount = this.discordBot.getGuilds().size;
        this.logger.info(this.className + ": Currently running on " + guildCount + " servers");
    };
    QueryBot.prototype.mapCommand = function (command) {
        var _this = this;
        return function (message, input, parameters, metadata) {
            command(_this.discordBot, message, input, parameters, metadata);
        };
    };
    QueryBot.prototype.onError = function (error, functionName) {
        return domain_1.outputError(this.logger, error, this.className + "." + functionName);
    };
    QueryBot.prototype.onGuildJoined = function (guild) {
        var systemChannel = guild.systemChannel;
        if (systemChannel) {
            systemChannel.send("Thanks for inviting me.\nIf you need anything, you can see my commands by sending the message `" + settings_1.botPrefix + " help`.");
        }
        this.logGuildCount();
    };
    QueryBot.prototype.onGuildLeft = function (guild) {
        var _this = this;
        this.serverProvider
            .deleteServerById(guild.id)
            .pipe(operators_1.tap(function () {
            _this.logger.info(_this.className + ": Deleted database entry for guild " + guild.id + " (\"" + guild.name + "\")");
        }), operators_1.catchError(function (error) { return rxjs_1.of(_this.onError(error, "onGuildLeft")); }))
            .subscribe();
        this.logGuildCount();
    };
    QueryBot.prototype.onLoad = function () {
        this.setActivityMessage(settings_1.botPrefix + " help", { type: 'LISTENING' });
        this.logGuildCount();
    };
    QueryBot.prototype.onMention = function (message) {
        this.discordBot.sendMessage(message, "Do you need something from me?\nYou can see my commands by sending the message `" + settings_1.botPrefix + " help`.");
    };
    QueryBot.prototype.setActivityMessage = function (activityMessage, activityOptions) {
        this.discordBot.setActivityMessage(activityMessage, activityOptions);
    };
    return QueryBot;
}());
exports.QueryBot = QueryBot;
