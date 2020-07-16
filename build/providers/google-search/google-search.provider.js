"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("request"));
var rxjs_1 = require("rxjs");
var GoogleSearchProvider = /** @class */ (function () {
    function GoogleSearchProvider() {
        this.session = request_1.default.defaults({ jar: true });
    }
    GoogleSearchProvider.prototype.search = function (query, options) {
        var _this = this;
        return new rxjs_1.Observable(function (observer) {
            var searchUri = "https://www.googleapis.com/customsearch/v1?q=" + query;
            for (var key in options) {
                searchUri += "&" + key + "=" + options[key];
            }
            _this.session.get({
                uri: encodeURI(searchUri),
                followRedirect: false,
            }, function (error, response) {
                if (error) {
                    observer.error(error);
                }
                else {
                    var googleSearchResult = JSON.parse(response.toJSON().body);
                    if (googleSearchResult.error)
                        observer.error(googleSearchResult.error.message);
                    observer.next(googleSearchResult.items || []);
                    observer.complete();
                }
            });
        });
    };
    return GoogleSearchProvider;
}());
exports.GoogleSearchProvider = GoogleSearchProvider;
