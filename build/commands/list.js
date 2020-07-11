"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var domain_1 = require("../domain");
var providers_1 = require("../providers");
var settings_1 = require("../settings");
exports.listSites = function (discordBot, message, input, parameters) {
    var guild = message.guild;
    if (guild) {
        providers_1.ServerProvider.getInstance()
            .getServerSiteKeywords(guild.id)
            .pipe(operators_1.tap(function (siteKeywords) {
            if (siteKeywords.length) {
                var list_1 = '';
                siteKeywords
                    .sort(function (a, b) { return (a.keyword > b.keyword ? 1 : -1); })
                    .forEach(function (site) {
                    list_1 += "\u2022 **" + site.keyword + "** (" + site.url + ")\n";
                });
                list_1 = list_1.substring(0, list_1.length - 1); // remove last line break
                discordBot.sendMessage(message, undefined, {
                    embed: {
                        color: settings_1.botColor,
                        title: 'Available keywords',
                        description: "" + list_1,
                    },
                });
            }
            else {
                discordBot.sendMessage(message, "No keywords available. Use command `" + settings_1.botPrefix + " help` to see how to add one.");
            }
        }), operators_1.catchError(function (error) {
            domain_1.outputError(discordBot.logger, error, "ServerProvider.getInstance().getServerSiteKeywords", [guild.id]);
            return rxjs_1.of(discordBot.sendError(message, error));
        }))
            .subscribe();
    }
};
