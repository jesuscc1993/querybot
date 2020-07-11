"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var server_domain_1 = require("../providers/server/server.domain");
var mongoose_2 = require("./mongoose");
var ServerDao = /** @class */ (function () {
    function ServerDao() {
        this.serverDocument = mongoose_1.model('Server', server_domain_1.getServerSchema());
        this.documentDao = new mongoose_2.DocumentDao();
    }
    ServerDao.prototype.connect = function (databaseUrl, databaseName) {
        return this.documentDao.connect(databaseUrl, databaseName);
    };
    ServerDao.prototype.create = function (server) {
        return this.documentDao.saveDocument(this.serverToDocument(server));
    };
    ServerDao.prototype.update = function (server) {
        return this.documentDao.updateDocument(this.serverDocument, { _id: server._id }, this.serverToDocument(server));
    };
    ServerDao.prototype.createOrUpdate = function (server) {
        return this.documentDao.saveOrUpdateDocument(this.serverDocument, { _id: server._id }, this.serverToDocument(server));
    };
    ServerDao.prototype.deleteById = function (serverId) {
        var server = { _id: serverId };
        return this.documentDao.deleteDocument(this.serverDocument, server, this.serverToDocument(server));
    };
    ServerDao.prototype.findById = function (serverId) {
        return this.documentDao.findDocument(this.serverDocument, { _id: serverId });
    };
    ServerDao.prototype.serverToDocument = function (server) {
        return new this.serverDocument({
            _id: server._id,
            keywordsMap: server.keywordsMap,
        });
    };
    return ServerDao;
}());
exports.ServerDao = ServerDao;
