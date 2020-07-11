"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputError = function (logger, error, functionName, parameters) {
    var errorMessage = error + " thrown";
    if (functionName)
        errorMessage += " when calling " + functionName;
    if (parameters)
        errorMessage += " with parameters: " + parameters.join(', ');
    logger.error(errorMessage + ".");
};
