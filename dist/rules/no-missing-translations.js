import { readFileSync } from 'fs';
import { ESLintUtils } from '@typescript-eslint/utils';
import { isIdentifier, isLiteral, isMemberExpression } from '../utils';
const createRule = ESLintUtils.RuleCreator(() => 'https://github.com/observation/eslint-rules');
const checkTranslationFileForKey = (translationFile, translationKey) => {
    const fileContent = readFileSync(translationFile, 'utf8');
    const jsonData = JSON.parse(fileContent);
    return !(translationKey in jsonData);
};
const checkCallExpression = (context, node, translationFiles) => {
    if (isMemberExpression(node.callee)) {
        const { object, property } = node.callee;
        if (isIdentifier(object) && isIdentifier(property)) {
            const [argument] = node.arguments;
            if (object.name === 'i18n' && property.name === 't' && isLiteral(argument)) {
                const translationKey = argument.value;
                if (typeof translationKey === 'string') {
                    const invalidTranslationFiles = translationFiles.filter((translationFile) => checkTranslationFileForKey(translationFile, translationKey));
                    if (invalidTranslationFiles.length > 0) {
                        context.report({
                            node,
                            messageId: 'missingTranslationKey',
                            data: {
                                translationKey,
                                invalidFiles: invalidTranslationFiles.map((file) => `'${file}'`).join(', '),
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
    name: 'no-missing-translations',
    meta: {
        docs: {
            description: 'All translation keys used in the codebase should have a corresponding translation in the translation files',
        },
        messages: {
            missingTranslationKey: "Translation key '{{ translationKey }}' is missing in: {{ invalidFiles }}",
        },
        type: 'problem',
        schema: [
            {
                type: 'object',
                properties: {
                    translationFiles: {
                        type: 'array',
                        items: { type: 'string' },
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
export default noMissingTranslations;
