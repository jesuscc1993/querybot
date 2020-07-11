"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var domain_1 = require("../domain");
var providers_1 = require("../providers");
var settings_1 = require("../settings");
exports.setSiteKeyword = function (discordBot, message, input, parameters) {
    var _a;
    if (parameters.length >= 2) {
        if (!((_a = message.member) === null || _a === void 0 ? void 0 : _a.hasPermission('ADMINISTRATOR'))) {
            discordBot.sendError(message, "``" + settings_1.botPrefix + " set`` command is restricted to administrators.");
            return;
        }
        var guild_1 = message.guild;
        if (guild_1) {
            var keyword_1 = parameters[0];
            var site_1 = parameters[1];
            providers_1.ServerProvider.getInstance()
                .setSiteKeyword(guild_1.id, keyword_1, site_1)
                .pipe(operators_1.tap(function () {
                discordBot.sendMessage(message, "Successfully set site \"" + site_1 + "\" to keyword \"" + keyword_1 + "\".");
            }), operators_1.catchError(function (error) {
                domain_1.outputError(discordBot.logger, error, "ServerProvider.getInstance().setSiteKeyword", [
                    guild_1.id,
                    keyword_1,
                    site_1,
                ]);
                return rxjs_1.of(discordBot.sendError(message, error));
            }))
                .subscribe();
        }
    }
    else {
        discordBot.onWrongParameterCount(message);
    }
};
