"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDate = function (date) {
    if (date === void 0) { date = new Date(); }
    return date.toISOString().split('T')[0];
};
exports.getDateTime = function (date) {
    if (date === void 0) { date = new Date(); }
    return date
        .toISOString()
        .split('.')[0]
        .replace('T', ' ');
};
exports.getTime = function (date) {
    if (date === void 0) { date = new Date(); }
    return date.toISOString().split(/T|\./g)[1];
};
