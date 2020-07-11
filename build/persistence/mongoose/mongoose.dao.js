"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true };
var MongooseDao = /** @class */ (function () {
    function MongooseDao() {
    }
    MongooseDao.prototype.configure = function (logger) {
        this.logger = logger;
    };
    MongooseDao.prototype.connect = function (databaseUrl, databaseName) {
        return rxjs_1.from(mongoose_1.connect(databaseUrl + "/" + databaseName, connectionOptions)).pipe(operators_1.map(function (_) { return undefined; }));
    };
    MongooseDao.prototype.info = function (message) {
        if (this.logger)
            this.logger.info("DocumentDao: " + message);
    };
    return MongooseDao;
}());
exports.MongooseDao = MongooseDao;
