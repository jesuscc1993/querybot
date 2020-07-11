"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var settings_1 = require("../settings");
exports.displayAbout = function (discordBot, message, input, parameters) {
    discordBot.sendMessage(message, undefined, {
        embed: {
            color: settings_1.botColor,
            description: "**# Description:**\n        Searches the web for user provided queries. Keywords can be set and used to restrict results to certain sites.\n        \n        **# Author**\n        [jesuscc1993](https://github.com/jesuscc1993/)\n        \n        **# Official site**\n        Feel free to upvote if you want to \uD83D\uDE09\n        [discordbots.org](https://discordbots.org/bot/495279079868596225)",
        },
    });
};
