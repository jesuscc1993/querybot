"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var server_dao_1 = require("../../persistence/server.dao");
var settings_1 = require("../../settings");
var google_search_provider_1 = require("../google-search/google-search.provider");
var ServerProvider = /** @class */ (function () {
    function ServerProvider() {
        this.siteMapToArray = function (keywordsMap) {
            return Object.keys(keywordsMap).map(function (keyword) { return ({ keyword: keyword, url: keywordsMap[keyword] }); });
        };
        if (ServerProvider._instance) {
            throw new Error('Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.');
        }
        ServerProvider._instance = this;
        this.serverDao = new server_dao_1.ServerDao();
        this.googleSearchProvider = new google_search_provider_1.GoogleSearchProvider();
        this.serverSiteKeywordsMap = {};
    }
    ServerProvider.getInstance = function () {
        return ServerProvider._instance;
    };
    ServerProvider.prototype.configure = function (googleSearchApiKey, googleSearchCx) {
        this.searchOptions = { cx: googleSearchCx, key: googleSearchApiKey };
        return this;
    };
    ServerProvider.prototype.connect = function (databaseUrl, databaseName) {
        return this.serverDao.connect(databaseUrl, databaseName);
    };
    ServerProvider.prototype.setSiteKeyword = function (serverId, keyword, url) {
        var _a;
        return this.saveOrUpdateServer({
            _id: serverId,
            keywordsMap: __assign(__assign({}, (this.serverSiteKeywordsMap[serverId] || settings_1.defaultSiteKeywordsMap)), (_a = {}, _a[keyword] = url, _a)),
        });
    };
    ServerProvider.prototype.unsetSiteKeyword = function (serverId, keyword) {
        var _this = this;
        return this.getServerSiteKeywordsMapOrSetDefaults(serverId).pipe(operators_1.flatMap(function (keywordsMap) {
            if (!keywordsMap[keyword]) {
                throw new Error("Keyword \"" + keyword + "\" does not exist.");
            }
            delete keywordsMap[keyword];
            return _this.saveOrUpdateServer({
                _id: serverId,
                keywordsMap: keywordsMap,
            });
        }));
    };
    ServerProvider.prototype.getSiteKeyword = function (serverId, keyword) {
        return (this.serverSiteKeywordsMap[serverId]
            ? rxjs_1.of(this.serverSiteKeywordsMap[serverId])
            : this.getServerSiteKeywordsMapOrSetDefaults(serverId)).pipe(operators_1.map(function (keywordsMap) { return keywordsMap[keyword]; }));
    };
    ServerProvider.prototype.getServerSiteKeywords = function (serverId) {
        return this.getServerSiteKeywordsMapOrSetDefaults(serverId).pipe(operators_1.map(this.siteMapToArray));
    };
    ServerProvider.prototype.search = function (serverId, query, nsfw, keyword) {
        var _this = this;
        var searchOptions = Object.assign({ num: 1, safe: nsfw ? 'off' : 'active' }, this.searchOptions);
        return (keyword
            ? this.getSiteKeyword(serverId, keyword).pipe(operators_1.flatMap(function (site) {
                if (site) {
                    searchOptions.siteSearch = site;
                    return rxjs_1.of({});
                }
                return rxjs_1.throwError(exports.invalidKeywordError);
            }))
            : rxjs_1.of({})).pipe(operators_1.flatMap(function () { return _this.googleSearchProvider.search(query, searchOptions); }));
    };
    ServerProvider.prototype.saveServer = function (server) {
        return this.serverDao.create(server).pipe(operators_1.tap(this.updateKeywordsFromServer));
    };
    ServerProvider.prototype.updateServer = function (server) {
        return this.serverDao.update(server).pipe(operators_1.tap(this.updateKeywordsFromServer));
    };
    ServerProvider.prototype.saveOrUpdateServer = function (server) {
        return this.serverDao.createOrUpdate(server).pipe(operators_1.tap(this.updateKeywordsFromServer));
    };
    ServerProvider.prototype.deleteServerById = function (serverId) {
        var _this = this;
        return this.serverDao.deleteById(serverId).pipe(operators_1.tap(function (_) { return delete _this.serverSiteKeywordsMap[serverId]; }));
    };
    ServerProvider.prototype.findServerById = function (serverId) {
        return this.serverDao.findById(serverId);
    };
    ServerProvider.prototype.updateKeywordsFromServer = function (server) {
        var _a;
        this.serverSiteKeywordsMap = __assign(__assign({}, this.serverSiteKeywordsMap), (_a = {}, _a[server._id] = server.keywordsMap, _a));
    };
    ServerProvider.prototype.getServerSiteKeywordsMapOrSetDefaults = function (serverId) {
        var _this = this;
        return this.serverDao.findById(serverId).pipe(operators_1.flatMap(function (server) {
            return server ? rxjs_1.of(server) : _this.saveServer({ _id: serverId, keywordsMap: __assign({}, settings_1.defaultSiteKeywordsMap) });
        }), operators_1.map(function (_a) {
            var keywordsMap = _a.keywordsMap;
            return keywordsMap;
        }), operators_1.tap(function (keywordsMap) {
            _this.serverSiteKeywordsMap[serverId] = keywordsMap;
        }));
    };
    ServerProvider._instance = new ServerProvider();
    return ServerProvider;
}());
exports.ServerProvider = ServerProvider;
exports.invalidKeywordError = 'Invalid keyword.';
