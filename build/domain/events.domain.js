"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEventHandlers = function (logger) {
    var unhandledRejections = new Map();
    process.on('exit', function (exitCode) {
        logger.error("Forced exit of code: " + exitCode);
    });
    process.on('unhandledRejection', function (reason, promise) {
        unhandledRejections.set(promise, reason);
        logger.error("Unhandled rejection: " + promise + " " + reason);
    });
    process.on('rejectionHandled', function (promise) {
        unhandledRejections.delete(promise);
        logger.error("Rejection handled: " + promise);
    });
    process.on('uncaughtException', function (error) {
        logger.error("Caught exception: " + error);
    });
    process.on('warning', function (warning) {
        logger.error("Process warning: " + warning.name + "\nMessage: " + warning.message + "\nStack trace:\n" + warning.trace);
    });
};
