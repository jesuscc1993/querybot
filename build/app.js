"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = __importStar(require("winston"));
var domain_1 = require("./domain");
var core_1 = require("./modules/core");
var settings_1 = require("./settings");
var logger = winston_1.default.createLogger({
    format: winston_1.format.combine(winston_1.format.label({ label: '[my-label]' }), winston_1.format.timestamp({ format: 'HH:mm:ss' }), winston_1.format.printf(function (info) { return info.timestamp + " [" + info.level.toUpperCase() + "] " + info.message; })),
    level: settings_1.logLevel,
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: settings_1.logPath + "/querybot-" + domain_1.getDate() + ".log" }),
    ],
});
domain_1.setupEventHandlers(logger);
new core_1.QueryBot(logger);
