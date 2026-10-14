"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const utils_2 = require("../utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => "https://github.com/observation/eslint-rules");
const isFunctionNode = (node) => node.type === utils_1.AST_NODE_TYPES.ArrowFunctionExpression ||
    node.type === utils_1.AST_NODE_TYPES.FunctionDeclaration ||
    node.type === utils_1.AST_NODE_TYPES.FunctionExpression;
const isTranslationCall = (node) => {
    const { callee } = node;
    return ((0, utils_2.isMemberExpression)(callee) &&
        (0, utils_2.isIdentifier)(callee.object) &&
        (0, utils_2.isIdentifier)(callee.property) &&
        callee.object.name === "i18n" &&
        callee.property.name === "t");
};
/**
 * Constructors run as soon as an instance is created, which for stores happens before the locale is set
 */
const isConstructor = (node) => {
    const { parent } = node;
    return parent !== undefined && (0, utils_2.isMethodDefinition)(parent) && parent.kind === "constructor";
};
/**
 * Immediately invoked functions run as soon as the surrounding code runs, e.g. `(() => i18n.t('key'))()`
 */
const isImmediatelyInvoked = (node) => {
    const { parent } = node;
    return parent !== undefined && (0, utils_2.isCallExpression)(parent) && parent.callee === node;
};
/**
 * A translation is deferred when it is inside a function that is only executed when it is called
 */
const isDeferred = (node) => {
    let current = node.parent;
    while (current) {
        if (isFunctionNode(current) && !isConstructor(current) && !isImmediatelyInvoked(current)) {
            return true;
        }
        current = current.parent;
    }
    return false;
};
const checkCallExpression = (context, node) => {
    if (isTranslationCall(node) && !isDeferred(node)) {
        context.report({
            node,
            messageId: "eagerTranslation",
        });
    }
};
const noEagerTranslations = createRule({
    create(context) {
        return {
            CallExpression: (node) => checkCallExpression(context, node),
        };
    },
    name: "no-eager-translations",
    meta: {
        docs: {
            description: "Translations should be evaluated when they are used, not when a module is loaded or a class is instantiated",
        },
        messages: {
            eagerTranslation: "i18n.t() is evaluated before the locale is set, so it is always in the default language. Move it into a function that is called when the text is needed.",
        },
        type: "problem",
        schema: [],
    },
    defaultOptions: [],
});
exports.default = noEagerTranslations;
