import * as path from "path";

import { TSESTree } from "@typescript-eslint/utils";
import { ESLintUtils } from "@typescript-eslint/utils";
import {
  RuleContext,
  RuleFixer,
} from "@typescript-eslint/utils/dist/ts-eslint";

// TOON 2 suggestions ipv 1 fix

import {
  isArrowFunctionExpression,
  isBlockStatement,
  isCallExpression,
  isExpressionStatement,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isLiteral,
  isMemberExpression,
  isMethodDefinition,
  isPropertyDefinition,
  isVariableDeclarator,
} from "../../utils";

const createRule = ESLintUtils.RuleCreator(
  () => "https://github.com/observation/obsidentify-eslint/README.md"
);

type messageIds =
  | "incorrectLogging"
  | "missingLogging"
  | "addLoggingSuggestion";

const addMissingLogStatementSuggestions = (
  context: Readonly<RuleContext<messageIds, any[]>>,
  node: TSESTree.Node,
  blockStatement: TSESTree.BlockStatement,
  correctLogging: string
) => {
  context.report({
    node,
    messageId: "missingLogging",
    suggest: [
      {
        messageId: "missingLogging",
        fix: (fixer: RuleFixer) => {
          const suggestedCode = `Log.trace('${correctLogging}');`;
          if (blockStatement.body.length === 0) {
            const newRange: TSESTree.Range = [
              blockStatement.range[0] + 1,
              blockStatement.range[1],
            ];
            return fixer.insertTextBeforeRange(newRange, suggestedCode);
          }

          return fixer.insertTextBeforeRange(
            blockStatement.body[0].range,
            suggestedCode
          );
        },
      },
      {
        messageId: "missingLogging",
        fix: (fixer) => {
          const suggestedCode = `Log.debug('${correctLogging}');`;
          if (blockStatement.body.length === 0) {
            const newRange: TSESTree.Range = [
              blockStatement.range[0] + 1,
              blockStatement.range[1],
            ];
            return fixer.insertTextBeforeRange(newRange, suggestedCode);
          }

          return fixer.insertTextBeforeRange(
            blockStatement.body[0].range,
            suggestedCode
          );
        },
      },
    ],
  });
};

const getFunctionName = (node?: TSESTree.Node): string | null => {
  if (!node) return null;

  if (isMethodDefinition(node)) {
    if (isIdentifier(node.key)) return node.key.name;
  }

  if (isFunctionDeclaration(node)) {
    return node.id ? node.id.name : null;
  }

  if (isVariableDeclarator(node)) {
    if (node.init && isArrowFunctionExpression(node.init)) {
      if (isIdentifier(node.id)) {
        return node.id ? node.id.name : null;
      }
    }
  }

  if (isPropertyDefinition(node)) {
    if (node.value && isArrowFunctionExpression(node.value)) {
      if (isIdentifier(node.key)) {
        return node.key.name;
      }
    }
  }

  return getFunctionName(node.parent);
};

const traceLevels = ["debug", "trace", "info", "warning", "error"];

const isLogStatement = (expression: TSESTree.CallExpression) => {
  return (
    isMemberExpression(expression.callee) &&
    isIdentifier(expression.callee.object) &&
    expression.callee.object.name === "Log" &&
    isIdentifier(expression.callee.property) &&
    traceLevels.includes(expression.callee.property.name)
  );
};

const containsLoggingStatement = (
  blockStatement: TSESTree.BlockStatement
): boolean => {
  for (var statement of blockStatement.body) {
    if (isExpressionStatement(statement)) {
      const { expression } = statement;

      if (isCallExpression(expression) && isLogStatement(expression)) {
        return true;
      }
    }
  }

  return false;
};

const checkFunctionDeclaration = (
  context: Readonly<RuleContext<messageIds, any[]>>,
  node: TSESTree.FunctionDeclaration
) => {
  const functionName = node.id ? node.id.name : "";
  const file = path.parse(context.getFilename());

  const correctLogging = `${file.name}:${functionName}`;
  if (!containsLoggingStatement(node.body)) {
    addMissingLogStatementSuggestions(context, node, node.body, correctLogging);
  }
};

const checkCallExpression = (
  context: Readonly<RuleContext<messageIds, any[]>>,
  node: TSESTree.CallExpression
) => {
  if (isLogStatement(node)) {
    const filename = path.parse(context.getFilename()).name;
    const functionName = getFunctionName(node);
    const expectedLogging =
      filename === functionName ? filename : `${filename}:${functionName}`;

    const [argument] = node.arguments;
    if (!argument) {
      const newRange: TSESTree.Range = [node.range[0], node.range[1] - 1];
      context.report({
        node,
        messageId: "incorrectLogging",
        data: { expectedLogging },
        suggest: [
          {
            messageId: "incorrectLogging",
            fix: (fixer) => {
              return fixer.insertTextAfterRange(
                newRange,
                `'${expectedLogging}'`
              );
            },
          },
        ],
      });
      return;
    }

    if (isLiteral(argument) && typeof argument.value === "string") {
      if (!argument.value.startsWith(expectedLogging)) {
        context.report({
          node,
          messageId: "incorrectLogging",
          data: { expectedLogging },
          suggest: [
            {
              messageId: "incorrectLogging",
              fix: (fixer) => {
                return fixer.replaceTextRange(
                  argument.range,
                  `'${expectedLogging}'`
                );
              },
            },
          ],
        });
      }
    }
  }
};

const checkVariableDeclaration = (
  context: Readonly<RuleContext<messageIds, any[]>>,
  node: TSESTree.VariableDeclaration
) => {
  if (node.declarations.length !== 1) return;

  const [declaration] = node.declarations;
  if (
    declaration.init &&
    isArrowFunctionExpression(declaration.init) &&
    isBlockStatement(declaration.init.body) &&
    isIdentifier(declaration.id)
  ) {
    const { body } = declaration.init;

    const filename = path.parse(context.getFilename()).name;
    const functionName = declaration.id.name;

    const isComponentDeclaration = filename === functionName;
    if (isComponentDeclaration) return;

    if (!containsLoggingStatement(body)) {
      const correctLogging = `${filename}:${functionName}`;
      addMissingLogStatementSuggestions(context, node, body, correctLogging);
    }
  }
};

const checkPropertyDefinition = (
  context: Readonly<RuleContext<messageIds, any[]>>,
  node: TSESTree.PropertyDefinition
) => {
  if (
    node.value &&
    isArrowFunctionExpression(node.value) &&
    isIdentifier(node.key) &&
    isBlockStatement(node.value.body)
  ) {
    const { body } = node.value;

    if (!containsLoggingStatement(body)) {
      const filename = path.parse(context.getFilename()).name;
      const functionName = node.key.name;
      const correctLogging =
        filename === functionName ? filename : `${filename}:${functionName}`;
      addMissingLogStatementSuggestions(context, node, body, correctLogging);
    }
  }
};

const checkMethodDefinition = (
  context: Readonly<RuleContext<messageIds, any[]>>,
  node: TSESTree.MethodDefinition
) => {
  if (node.kind === "constructor") return;
  if (node.kind === "get") return;

  if (isFunctionExpression(node.value) && isIdentifier(node.key)) {
    const { body } = node.value;
    if (!containsLoggingStatement(body)) {
      const filename = path.parse(context.getFilename()).name;
      const functionName = node.key.name;
      const correctLogging =
        filename === functionName ? filename : `${filename}:${functionName}`;
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
      incorrectLogging:
        "Logging should include the filename and function name: Log.debug('{{ expectedLogging }}')",
      missingLogging: "Functions should include at least one logging statement",
      addLoggingSuggestion:
        "Add Logging statement at beginning of block statement",
    },
    type: "suggestion",
    fixable: "code",
    schema: [],
    hasSuggestions: true,
  },
  defaultOptions: [],
});

export default noFunctionWithoutLogging;
