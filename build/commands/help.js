"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var settings_1 = require("../settings");
exports.displayHelp = function (discordBot, message, input, parameters) {
    discordBot.sendMessage(message, undefined, {
        embed: {
            color: settings_1.botColor,
            description: "**# Commands:**\n\n      **`" + settings_1.botPrefix + " about`**\n      Displays information about the bot.\n      \n      **`" + settings_1.botPrefix + " help`, `" + settings_1.botPrefix + " ?`**\n      Displays the bot's help.\n      \n      **`" + settings_1.botPrefix + " list`, `" + settings_1.botPrefix + " ls`**\n      Displays all available keywords.\n      \n      **`" + settings_1.botPrefix + " set {keyword} {siteUrl}`**\n      Sets a site url to a keyword. Example: `" + settings_1.botPrefix + " set yt youtube.com`.\n      \n      **`" + settings_1.botPrefix + " unset {keyword}`**\n      Unsets a site keyword. Example: `" + settings_1.botPrefix + " unset yt`.\n      \n      **`" + settings_1.botPrefix + " search {query}`, `" + settings_1.botPrefix + " s {query}`**\n      Returns the first search result matching a query on any site. Example: `" + settings_1.botPrefix + " search discord bots`.\n      \n      **`" + settings_1.botPrefixDefault + "{keyword} {query}`**\n      Returns the first search result matching a query on the site corresponding to a keyword. Example: `" + settings_1.botPrefixDefault + "yt GMM`.\n      \n      **`" + settings_1.botPrefix + " stats`**\n      Displays bot statistics.\n      \n      **# Issues and suggestions:**      \n      Got an issue or suggestion? You can report them here:\n      [github.com](https://github.com/jesuscc1993/querybot/issues)\n      ",
        },
    });
};
