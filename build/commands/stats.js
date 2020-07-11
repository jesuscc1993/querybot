"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var domain_1 = require("../domain");
var settings_1 = require("../settings");
exports.displayStats = function (discordBot, message, input, parameters) {
    var client = discordBot.getClient();
    var guildCount = client.guilds.cache.size;
    var statistics = ["Running on " + guildCount + " servers"];
    if (client.uptime)
        statistics.push("Running since " + domain_1.getDateTime(new Date(new Date().getTime() - client.uptime)) + " (server time)");
    discordBot.sendMessage(message, undefined, {
        embed: {
            color: settings_1.botColor,
            description: "**# Statistics:**\n" + statistics.join("\n"),
        },
    });
};
