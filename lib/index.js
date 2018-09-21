"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.errorHandler = function (error, _, reply) {
    if (error.validation) {
        error.type = 'DOCUMENT_VALIDATION_ERROR';
        error.details = error.validation;
    }
    var statusCode = error.statusCode || 500;
    reply.code(statusCode);
    var response = statusCode !== 500
        ? {
            error: error.type,
            message: error.message,
            statusCode: statusCode,
            details: error.details,
        }
        : {
            error: error.type,
            message: 'Something went wrong. Try again later.',
            statusCode: statusCode,
        };
    reply.send(response);
};
exports.default = fastify_plugin_1.default(function protovisionPlugin(fastify, _, next) {
    fastify.setErrorHandler(exports.errorHandler);
    next();
});
//# sourceMappingURL=index.js.map