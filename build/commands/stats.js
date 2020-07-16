"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var domain_1 = require("../domain");
var settings_1 = require("../settings");
exports.displayStats = function (discordBot, message, input, parameters) {
    var statistics = [];
    var guildCount = discordBot.getGuilds().size;
    statistics.push(["Running on " + guildCount + " servers"]);
    var uptime = discordBot.getClient().uptime;
    if (uptime)
        statistics.push("Running since " + domain_1.getDateTime(new Date(new Date().getTime() - uptime)) + " (server time)");
    discordBot.sendMessage(message, undefined, {
        embed: {
            color: settings_1.botColor,
            description: "**# Statistics:**\n" + statistics.join("\n"),
        },
    });
};
