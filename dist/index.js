"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const no_function_without_logging_1 = require("./rules/no-function-without-logging");
const no_missing_translations_1 = require("./rules/no-missing-translations");
const rules = {
    "no-function-without-logging": no_function_without_logging_1.default,
    'no-missing-translations': no_missing_translations_1.default,
};
exports.rules = rules;
