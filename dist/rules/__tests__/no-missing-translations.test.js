"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const no_missing_translations_1 = __importDefault(require("../no-missing-translations"));
const globals_1 = require("@jest/globals");
const ruleTester = new rule_tester_1.RuleTester();
globals_1.jest.mock("fs", () => {
    const actualFs = globals_1.jest.requireActual("fs");
    const newFs = {
        ...actualFs,
        readFileSync: globals_1.jest.fn((file) => {
            if (file === "en.json") {
                return JSON.stringify({
                    "Existing key": "Existing key",
                    "Key that only exists in en.json": "Key that only exists in en.json",
                });
            }
            if (file === "nl.json") {
                return JSON.stringify({
                    "Existing key": "Bestaande sleutel",
                });
            }
        }),
    };
    return {
        __esModule: true,
        ...newFs,
    };
});
ruleTester.run("no-missing-translations", no_missing_translations_1.default, {
    valid: [
        {
            name: "Function declaration",
            code: "i18n.t('Existing key')",
            options: [
                {
                    translationFiles: ["en.json", "nl.json"],
                },
            ],
        },
    ],
    invalid: [
        {
            name: "Missing translation key in multiple files",
            code: 'i18n.t("Missing key")',
            errors: [
                {
                    messageId: "missingTranslationKey",
                    data: {
                        translationKey: "Missing key",
                        invalidFiles: "'en.json', 'nl.json'",
                    },
                },
            ],
            options: [
                {
                    translationFiles: ["en.json", "nl.json"],
                },
            ],
        },
        {
            name: "Missing translation key in one file",
            code: 'i18n.t("Key that only exists in en.json")',
            errors: [
                {
                    messageId: "missingTranslationKey",
                    data: {
                        translationKey: "Key that only exists in en.json",
                        invalidFiles: "'nl.json'",
                    },
                },
            ],
            options: [
                {
                    translationFiles: ["en.json", "nl.json"],
                },
            ],
        },
    ],
});
