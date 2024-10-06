"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const no_function_without_logging_1 = __importDefault(require("./rules/no-function-without-logging"));
const rules = {
    'no-function-without-logging': no_function_without_logging_1.default,
};
exports.rules = rules;
