"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const utils_1 = require("@typescript-eslint/utils");
const utils_2 = require("../utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => "https://github.com/observation/eslint-rules");
const checkTranslationFileForKey = (translationFile, translationKey) => {
    const fileContent = (0, fs_1.readFileSync)(translationFile, "utf8");
    const jsonData = JSON.parse(fileContent);
    return !(translationKey in jsonData);
};
const checkCallExpression = (context, node, translationFiles) => {
    if ((0, utils_2.isMemberExpression)(node.callee)) {
        const { object, property } = node.callee;
        if ((0, utils_2.isIdentifier)(object) && (0, utils_2.isIdentifier)(property)) {
            const [argument] = node.arguments;
            if (object.name === "i18n" &&
                property.name === "t" &&
                (0, utils_2.isLiteral)(argument)) {
                const translationKey = argument.value;
                if (typeof translationKey === "string") {
                    const invalidTranslationFiles = translationFiles.filter((translationFile) => checkTranslationFileForKey(translationFile, translationKey));
                    if (invalidTranslationFiles.length > 0) {
                        context.report({
                            node,
                            messageId: "missingTranslationKey",
                            data: {
                                translationKey,
                                invalidFiles: invalidTranslationFiles
                                    .map((file) => `'${file}'`)
                                    .join(", "),
                            },
                        });
                    }
                }
            }
        }
    }
};
const noMissingTranslations = createRule({
    create(context, options) {
        const [{ translationFiles }] = options;
        return {
            CallExpression: (node) => checkCallExpression(context, node, translationFiles),
        };
    },
    name: "no-missing-translations",
    meta: {
        docs: {
            description: "All translation keys used in the codebase should have a corresponding translation in the translation files",
            recommended: "error",
        },
        messages: {
            missingTranslationKey: "Translation key '{{ translationKey }}' is missing in: {{ invalidFiles }}",
        },
        type: "problem",
        schema: [
            {
                type: "object",
                properties: {
                    translationFiles: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [
        {
            translationFiles: [],
        },
    ],
});
exports.default = noMissingTranslations;
