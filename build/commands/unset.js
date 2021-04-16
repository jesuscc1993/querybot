"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var domain_1 = require("../domain");
var providers_1 = require("../providers");
var settings_1 = require("../settings");
exports.unsetSiteKeyword = function (discordBot, message, input, parameters) {
    var _a;
    if (parameters.length >= 1) {
        var guild_1 = message.guild, member = message.member;
        if (!((_a = member) === null || _a === void 0 ? void 0 : _a.hasPermission('MANAGE_GUILD'))) {
            discordBot.sendError(message, "``" + settings_1.botPrefix + " unset`` command requires the \"Manage Server\" permission.");
            return;
        }
        if (guild_1) {
            var keyword_1 = parameters[0];
            providers_1.ServerProvider.getInstance()
                .unsetSiteKeyword(guild_1.id, keyword_1)
                .pipe(operators_1.tap(function () {
                discordBot.sendMessage(message, "Successfully unset keyword \"" + keyword_1 + "\".");
            }), operators_1.catchError(function (error) {
                domain_1.outputError(discordBot.logger, error, "ServerProvider.getInstance().unsetSiteKeyword", [guild_1.id, keyword_1]);
                return rxjs_1.of(discordBot.sendError(message, error));
            }))
                .subscribe();
        }
    }
    else {
        discordBot.onWrongParameterCount(message);
    }
};
