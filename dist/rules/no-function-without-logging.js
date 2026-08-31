"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = void 0;
const path = __importStar(require("path"));
const utils_1 = require("@typescript-eslint/utils");
const utils_2 = require("../utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => "https://github.com/observation/eslint-rules");
const getClassName = (filename) => {
    const base = path.basename(filename);
    const firstDotIndex = base.indexOf(".");
    return firstDotIndex === -1 ? base : base.slice(0, firstDotIndex);
};
const isIgnored = (functionName, patterns) => {
    if (!functionName || patterns.length === 0)
        return false;
    return patterns.some((pattern) => new RegExp(pattern).test(functionName));
};
const createSuggestions = (blockStatement, suggestedLogging) => {
    const logLevels = ["trace", "debug"];
    return logLevels.map((logLevel) => {
        const suggestedCode = `Log.${logLevel}('${suggestedLogging}');`;
        return {
            messageId: "addLoggingSuggestion",
            data: { suggestedCode },
            fix: (fixer) => {
                if (blockStatement.body.length === 0) {
                    const newRange = [
                        blockStatement.range[0] + 1,
                        blockStatement.range[1],
                    ];
                    return fixer.insertTextBeforeRange(newRange, suggestedCode);
                }
                return fixer.insertTextBeforeRange(blockStatement.body[0].range, suggestedCode);
            },
        };
    });
};
const addMissingLogStatementSuggestions = (context, node, blockStatement, correctLogging) => {
    context.report({
        node,
        messageId: "missingLogging",
        data: { expectedLogging: correctLogging },
        suggest: createSuggestions(blockStatement, correctLogging),
    });
};
const getFunctionName = (node) => {
    if (!node)
        return null;
    if ((0, utils_2.isMethodDefinition)(node)) {
        if ((0, utils_2.isIdentifier)(node.key))
            return node.key.name;
    }
    if ((0, utils_2.isFunctionDeclaration)(node)) {
        return node.id ? node.id.name : null;
    }
    if ((0, utils_2.isVariableDeclarator)(node)) {
        if (node.init && (0, utils_2.isArrowFunctionExpression)(node.init)) {
            if ((0, utils_2.isIdentifier)(node.id)) {
                return node.id ? node.id.name : null;
            }
        }
    }
    if ((0, utils_2.isPropertyDefinition)(node)) {
        if (node.value && (0, utils_2.isArrowFunctionExpression)(node.value)) {
            if ((0, utils_2.isIdentifier)(node.key)) {
                return node.key.name;
            }
        }
    }
    return getFunctionName(node.parent);
};
const traceLevels = ["debug", "trace", "info", "warning", "error"];
const isLogStatement = (expression) => {
    return ((0, utils_2.isMemberExpression)(expression.callee) &&
        (0, utils_2.isIdentifier)(expression.callee.object) &&
        expression.callee.object.name === "Log" &&
        (0, utils_2.isIdentifier)(expression.callee.property) &&
        traceLevels.includes(expression.callee.property.name));
};
const containsLoggingStatement = (blockStatement) => {
    for (var statement of blockStatement.body) {
        if ((0, utils_2.isExpressionStatement)(statement)) {
            const { expression } = statement;
            if ((0, utils_2.isCallExpression)(expression) && isLogStatement(expression)) {
                return true;
            }
        }
    }
    return false;
};
const checkFunctionDeclaration = (context, node, ignoreList) => {
    const functionName = node.id ? node.id.name : "";
    if (isIgnored(functionName, ignoreList))
        return;
    const className = getClassName(context.getFilename());
    const correctLogging = `${className}:${functionName}`;
    if (!containsLoggingStatement(node.body)) {
        addMissingLogStatementSuggestions(context, node, node.body, correctLogging);
    }
};
const checkCallExpression = (context, node, ignoreList) => {
    if (isLogStatement(node)) {
        const filename = getClassName(context.getFilename());
        const functionName = getFunctionName(node);
        if (isIgnored(functionName, ignoreList))
            return;
        const expectedLogging = filename === functionName ? filename : `${filename}:${functionName}`;
        const [argument] = node.arguments;
        if (!argument) {
            const newRange = [node.range[0], node.range[1] - 1];
            context.report({
                node,
                messageId: "incorrectLogging",
                data: { expectedLogging },
                suggest: [
                    {
                        messageId: "incorrectLogging",
                        data: { expectedLogging },
                        fix: (fixer) => {
                            return fixer.insertTextAfterRange(newRange, `'${expectedLogging}'`);
                        },
                    },
                ],
            });
            return;
        }
        if ((0, utils_2.isLiteral)(argument) && typeof argument.value === "string") {
            if (!argument.value.startsWith(expectedLogging)) {
                context.report({
                    node,
                    messageId: "incorrectLogging",
                    data: { expectedLogging },
                    suggest: [
                        {
                            messageId: "incorrectLogging",
                            data: { expectedLogging },
                            fix: (fixer) => {
                                return fixer.replaceTextRange(argument.range, `'${expectedLogging}'`);
                            },
                        },
                    ],
                });
            }
        }
    }
};
const checkVariableDeclaration = (context, node, ignoreList) => {
    if (node.declarations.length !== 1)
        return;
    const [declaration] = node.declarations;
    if (declaration.init &&
        (0, utils_2.isArrowFunctionExpression)(declaration.init) &&
        (0, utils_2.isBlockStatement)(declaration.init.body) &&
        (0, utils_2.isIdentifier)(declaration.id)) {
        const { body } = declaration.init;
        const filename = getClassName(context.getFilename());
        const functionName = declaration.id.name;
        const isComponentDeclaration = filename === functionName;
        if (isComponentDeclaration)
            return;
        if (isIgnored(functionName, ignoreList))
            return;
        if (!containsLoggingStatement(body)) {
            const correctLogging = `${filename}:${functionName}`;
            addMissingLogStatementSuggestions(context, node, body, correctLogging);
        }
    }
};
const checkPropertyDefinition = (context, node, ignoreList) => {
    if (node.value &&
        (0, utils_2.isArrowFunctionExpression)(node.value) &&
        (0, utils_2.isIdentifier)(node.key) &&
        (0, utils_2.isBlockStatement)(node.value.body)) {
        const { body } = node.value;
        const filename = getClassName(context.getFilename());
        const functionName = node.key.name;
        if (isIgnored(functionName, ignoreList))
            return;
        if (!containsLoggingStatement(body)) {
            const correctLogging = filename === functionName ? filename : `${filename}:${functionName}`;
            addMissingLogStatementSuggestions(context, node, body, correctLogging);
        }
    }
};
const isSetterLikeMethodDefinition = (node, functionName) => {
    const { returnType } = node.value;
    const returnsVoid = returnType === undefined ||
        returnType.typeAnnotation.type === "TSVoidKeyword";
    const startsWithSetterLikeName = new RegExp("^set[A-Z].*");
    const hasSetterLikeFunctionName = startsWithSetterLikeName.test(functionName);
    return hasSetterLikeFunctionName && returnsVoid;
};
const checkMethodDefinition = (context, node, ignoreList) => {
    if (node.kind === "constructor")
        return;
    if (node.kind === "get")
        return;
    if (node.kind === "set")
        return;
    if ((0, utils_2.isFunctionExpression)(node.value) && (0, utils_2.isIdentifier)(node.key)) {
        const { body } = node.value;
        const filename = getClassName(context.getFilename());
        const functionName = node.key.name;
        if (isSetterLikeMethodDefinition(node, functionName))
            return;
        if (isIgnored(functionName, ignoreList))
            return;
        if (!containsLoggingStatement(body)) {
            const correctLogging = filename === functionName ? filename : `${filename}:${functionName}`;
            addMissingLogStatementSuggestions(context, node, body, correctLogging);
        }
    }
};
const noFunctionWithoutLogging = createRule({
    create(context) {
        const ignoreList = context.options[0]?.ignoreList ?? [];
        return {
            FunctionDeclaration: (node) => checkFunctionDeclaration(context, node, ignoreList),
            CallExpression: (node) => checkCallExpression(context, node, ignoreList),
            VariableDeclaration: (node) => checkVariableDeclaration(context, node, ignoreList),
            PropertyDefinition: (node) => checkPropertyDefinition(context, node, ignoreList),
            MethodDefinition: (node) => checkMethodDefinition(context, node, ignoreList),
        };
    },
    name: "no-function-without-logging",
    meta: {
        docs: {
            description: "All functions should include a logging statement",
        },
        messages: {
            incorrectLogging: "Logging should include the filename and function name: Log.debug('{{ expectedLogging }}')",
            missingLogging: "Functions should include at least one logging statement",
            addLoggingSuggestion: "Add '{{ suggestedCode }}' at beginning of block statement",
        },
        type: "suggestion",
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    ignoreList: {
                        type: "array",
                        items: { type: "string" },
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        hasSuggestions: true,
    },
    defaultOptions: [{}],
});
exports.configs = {
    recommended: {
        plugins: ['observation'],
        rules: {
            'observation/no-function-without-logging': 'error',
        },
    },
};
exports.default = noFunctionWithoutLogging;
