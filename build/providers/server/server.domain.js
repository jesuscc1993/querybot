"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.getServerSite = function (server, keyword) {
    return server.keywordsMap[keyword] || undefined;
};
exports.getServerSchema = function () {
    return new mongoose_1.Schema({
        _id: String,
        keywordsMap: Object,
        updated: {
            type: Date,
            default: Date.now,
        },
    }, {
        minimize: false,
    });
};
