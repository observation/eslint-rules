"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_1 = require("@typescript-eslint/utils");
const utils_2 = require("../../utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => "https://github.com/observation/eslint-rules");
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
const checkFunctionDeclaration = (context, node) => {
    const functionName = node.id ? node.id.name : "";
    const file = path.parse(context.getFilename());
    const correctLogging = `${file.name}:${functionName}`;
    if (!containsLoggingStatement(node.body)) {
        addMissingLogStatementSuggestions(context, node, node.body, correctLogging);
    }
};
const checkCallExpression = (context, node) => {
    if (isLogStatement(node)) {
        const filename = path.parse(context.getFilename()).name;
        const functionName = getFunctionName(node);
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
const checkVariableDeclaration = (context, node) => {
    if (node.declarations.length !== 1)
        return;
    const [declaration] = node.declarations;
    if (declaration.init &&
        (0, utils_2.isArrowFunctionExpression)(declaration.init) &&
        (0, utils_2.isBlockStatement)(declaration.init.body) &&
        (0, utils_2.isIdentifier)(declaration.id)) {
        const { body } = declaration.init;
        const filename = path.parse(context.getFilename()).name;
        const functionName = declaration.id.name;
        const isComponentDeclaration = filename === functionName;
        if (isComponentDeclaration)
            return;
        if (!containsLoggingStatement(body)) {
            const correctLogging = `${filename}:${functionName}`;
            addMissingLogStatementSuggestions(context, node, body, correctLogging);
        }
    }
};
const checkPropertyDefinition = (context, node) => {
    if (node.value &&
        (0, utils_2.isArrowFunctionExpression)(node.value) &&
        (0, utils_2.isIdentifier)(node.key) &&
        (0, utils_2.isBlockStatement)(node.value.body)) {
        const { body } = node.value;
        if (!containsLoggingStatement(body)) {
            const filename = path.parse(context.getFilename()).name;
            const functionName = node.key.name;
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
const checkMethodDefinition = (context, node) => {
    if (node.kind === "constructor")
        return;
    if (node.kind === "get")
        return;
    if (node.kind === "set")
        return;
    if ((0, utils_2.isFunctionExpression)(node.value) && (0, utils_2.isIdentifier)(node.key)) {
        const { body } = node.value;
        if (!containsLoggingStatement(body)) {
            const filename = path.parse(context.getFilename()).name;
            const functionName = node.key.name;
            if (isSetterLikeMethodDefinition(node, functionName))
                return;
            const correctLogging = filename === functionName ? filename : `${filename}:${functionName}`;
            addMissingLogStatementSuggestions(context, node, body, correctLogging);
        }
    }
};
const noFunctionWithoutLogging = createRule({
    create(context) {
        return {
            FunctionDeclaration: (node) => checkFunctionDeclaration(context, node),
            CallExpression: (node) => checkCallExpression(context, node),
            VariableDeclaration: (node) => checkVariableDeclaration(context, node),
            PropertyDefinition: (node) => checkPropertyDefinition(context, node),
            MethodDefinition: (node) => checkMethodDefinition(context, node),
        };
    },
    name: "no-function-without-logging",
    meta: {
        docs: {
            description: "All functions should include a logging statement",
            recommended: "error",
        },
        messages: {
            incorrectLogging: "Logging should include the filename and function name: Log.debug('{{ expectedLogging }}')",
            missingLogging: "Functions should include at least one logging statement",
            addLoggingSuggestion: "Add '{{ suggestedCode }}' at beginning of block statement",
        },
        type: "suggestion",
        fixable: "code",
        schema: [],
        hasSuggestions: true,
    },
    defaultOptions: [],
});
exports.default = noFunctionWithoutLogging;
