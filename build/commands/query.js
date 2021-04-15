"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var domain_1 = require("../domain");
var providers_1 = require("../providers");
var settings_1 = require("../settings");
exports.query = function (discordBot, message, input, parameters, metadata) {
    var commandCount = message.content
        .split('\n')
        .reduce(function (count, line) { return count + (lineContainsPrefix(line, settings_1.botPrefixDefault) ? 1 : 0); }, 0);
    if (commandCount > 1) {
        if (metadata.commandIndex === 0) {
            discordBot.sendError(message, 'Search command is restricted to one usage per message.');
        }
        return;
    }
    var keywordSearch = !input.includes(settings_1.botPrefix + " ");
    var keyword = keywordSearch ? input.split(' ')[0].substring(settings_1.botPrefixDefault.length) : undefined;
    if ((!keywordSearch || keyword) && parameters.length) {
        var search_1 = parameters.join(' ');
        var nsfw_1 = message.channel.nsfw;
        console.log('search, keyword', search_1, keyword);
        var guild_1 = message.guild;
        if (guild_1) {
            providers_1.ServerProvider.getInstance()
                .search(guild_1.id, search_1, nsfw_1, keyword)
                .pipe(operators_1.tap(function (searchResultItems) {
                var messageText = "This is what I found:";
                if (!searchResultItems.length) {
                    discordBot.sendMessage(message, "No results found.");
                }
                else if (searchResultItems.length === 1) {
                    discordBot.sendMessage(message, messageText + "\n" + searchResultItems[0].link);
                }
                else {
                    discordBot.sendMessage(message, "" + messageText);
                    searchResultItems.forEach(function (searchResultItem) {
                        discordBot.sendMessage(message, searchResultItem.link);
                        // discordBot.sendMessage(message, undefined, getEmbedFromGoogleSearchResultItem(discordBot, searchResultItem));
                    });
                }
            }), operators_1.catchError(function (error) {
                if (error === providers_1.invalidKeywordError)
                    return rxjs_1.of();
                domain_1.outputError(discordBot.logger, error, "ServerProvider.getInstance().search", [
                    guild_1.id,
                    search_1,
                    nsfw_1,
                    keyword,
                ]);
                return rxjs_1.of(discordBot.sendError(message, error));
            }))
                .subscribe();
        }
    }
    else if (!keywordSearch) {
        discordBot.onWrongParameterCount(message);
    }
};
var lineContainsPrefix = function (line, prefix) {
    return line.indexOf(prefix) === 0 && line.substring(prefix.length).charAt(0) !== ' ';
};
/*const getEmbedFromGoogleSearchResultItem = (discordBot: DiscordBot, searchResultItem: GoogleSearchResultItem): MessageOptions => {
  let description: string = '';
  description += `[${searchResultItem.title}](${encodeUrl(searchResultItem.link)})\n`;
  description += `${searchResultItem.snippet}\n`;

  let image: { url?: string } = {};
  if (searchResultItem.pagemap.cse_image && searchResultItem.pagemap.cse_image.length) {
    image.url = searchResultItem.pagemap.cse_image[0].src;
  }

  return {
    embed: {
      color: botColor,
      description: description,
      image: image
    }
  };

};

const encodeUrl = (url: string) => url.replace(/\(/g, '%28').replace(/\)/g, '%29');*/
