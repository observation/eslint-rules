import * as path from "path"
import { TSESLint, TSESTree, ESLintUtils } from '@typescript-eslint/utils'

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
} from "../utils"

const createRule = ESLintUtils.RuleCreator(
  () => "https://github.com/observation/eslint-rules"
)

type messageIds = "incorrectLogging" | "missingLogging" | "addLoggingSuggestion"

type Options = [{ ignoreList?: string[] }]

const getClassName = (filename: string): string => {
  const base = path.basename(filename)
  const firstDotIndex = base.indexOf(".")
  return firstDotIndex === -1 ? base : base.slice(0, firstDotIndex)
}

const isIgnored = (functionName: string | null, patterns: string[]): boolean => {
  if (!functionName || patterns.length === 0) return false
  return patterns.some((pattern) => new RegExp(pattern).test(functionName))
}

const createSuggestions = (
  blockStatement: TSESTree.BlockStatement,
  suggestedLogging: string
): TSESLint.ReportSuggestionArray<"addLoggingSuggestion"> => {
  const logLevels = ["trace", "debug"]
  return logLevels.map((logLevel) => {
    const suggestedCode = `Log.${logLevel}('${suggestedLogging}');`
    return {
      messageId: "addLoggingSuggestion",
      data: { suggestedCode },
      fix: (fixer: TSESLint.RuleFixer) => {
        if (blockStatement.body.length === 0) {
          const newRange: TSESTree.Range = [
            blockStatement.range[0] + 1,
            blockStatement.range[1],
          ]
          return fixer.insertTextBeforeRange(newRange, suggestedCode)
        }

        return fixer.insertTextBeforeRange(
          blockStatement.body[0].range,
          suggestedCode
        )
      },
    }
  })
}

const addMissingLogStatementSuggestions = (
  context: Readonly<TSESLint.RuleContext<messageIds, any[]>>,
  node: TSESTree.Node,
  blockStatement: TSESTree.BlockStatement,
  correctLogging: string
) => {
  context.report({
    node,
    messageId: "missingLogging",
    data: { expectedLogging: correctLogging },
    suggest: createSuggestions(blockStatement, correctLogging),
  })
}

const getFunctionName = (node?: TSESTree.Node): string | null => {
  if (!node) return null

  if (isMethodDefinition(node)) {
    if (isIdentifier(node.key)) return node.key.name
  }

  if (isFunctionDeclaration(node)) {
    return node.id ? node.id.name : null
  }

  if (isVariableDeclarator(node)) {
    if (node.init && isArrowFunctionExpression(node.init)) {
      if (isIdentifier(node.id)) {
        return node.id ? node.id.name : null
      }
    }
  }

  if (isPropertyDefinition(node)) {
    if (node.value && isArrowFunctionExpression(node.value)) {
      if (isIdentifier(node.key)) {
        return node.key.name
      }
    }
  }

  return getFunctionName(node.parent)
}

const traceLevels = ["debug", "trace", "info", "warning", "error"]

const isLogStatement = (expression: TSESTree.CallExpression) => {
  return (
    isMemberExpression(expression.callee) &&
    isIdentifier(expression.callee.object) &&
    expression.callee.object.name === "Log" &&
    isIdentifier(expression.callee.property) &&
    traceLevels.includes(expression.callee.property.name)
  )
}

const containsLoggingStatement = (
  blockStatement: TSESTree.BlockStatement
): boolean => {
  for (var statement of blockStatement.body) {
    if (isExpressionStatement(statement)) {
      const { expression } = statement

      if (isCallExpression(expression) && isLogStatement(expression)) {
        return true
      }
    }
  }

  return false
}

const checkFunctionDeclaration = (
  context: Readonly<TSESLint.RuleContext<messageIds, Options>>,
  node: TSESTree.FunctionDeclaration,
  ignoreList: string[]
) => {
  const functionName = node.id ? node.id.name : ""
  if (isIgnored(functionName, ignoreList)) return

  const className = getClassName(context.getFilename())

  const correctLogging = `${className}:${functionName}`
  if (!containsLoggingStatement(node.body)) {
    addMissingLogStatementSuggestions(context, node, node.body, correctLogging)
  }
}

const checkCallExpression = (
  context: Readonly<TSESLint.RuleContext<messageIds, Options>>,
  node: TSESTree.CallExpression,
  ignoreList: string[]
) => {
  if (isLogStatement(node)) {
    const filename = getClassName(context.getFilename())
    const functionName = getFunctionName(node)
    if (isIgnored(functionName, ignoreList)) return
    const expectedLogging = filename === functionName ? filename : `${filename}:${functionName}`

    const [argument] = node.arguments
    if (!argument) {
      const newRange: TSESTree.Range = [node.range[0], node.range[1] - 1]
      context.report({
        node,
        messageId: "incorrectLogging",
        data: { expectedLogging },
        suggest: [
          {
            messageId: "incorrectLogging",
            data: { expectedLogging },
            fix: (fixer: TSESLint.RuleFixer) => {
              return fixer.insertTextAfterRange(
                newRange,
                `'${expectedLogging}'`
              )
            },
          },
        ],
      })
      return
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
              data: { expectedLogging },
              fix: (fixer: TSESLint.RuleFixer) => {
                return fixer.replaceTextRange(
                  argument.range,
                  `'${expectedLogging}'`
                )
              },
            },
          ],
        })
      }
    }
  }
}

const checkVariableDeclaration = (
  context: Readonly<TSESLint.RuleContext<messageIds, Options>>,
  node: TSESTree.VariableDeclaration,
  ignoreList: string[]
) => {
  if (node.declarations.length !== 1) return

  const [declaration] = node.declarations
  if (
    declaration.init &&
    isArrowFunctionExpression(declaration.init) &&
    isBlockStatement(declaration.init.body) &&
    isIdentifier(declaration.id)
  ) {
    const { body } = declaration.init

    const filename = getClassName(context.getFilename())
    const functionName = declaration.id.name

    const isComponentDeclaration = filename === functionName
    if (isComponentDeclaration) return
    if (isIgnored(functionName, ignoreList)) return

    if (!containsLoggingStatement(body)) {
      const correctLogging = `${filename}:${functionName}`
      addMissingLogStatementSuggestions(context, node, body, correctLogging)
    }
  }
}

const checkPropertyDefinition = (
  context: Readonly<TSESLint.RuleContext<messageIds, Options>>,
  node: TSESTree.PropertyDefinition,
  ignoreList: string[]
) => {
  if (
    node.value &&
    isArrowFunctionExpression(node.value) &&
    isIdentifier(node.key) &&
    isBlockStatement(node.value.body)
  ) {
    const { body } = node.value
    const filename = getClassName(context.getFilename())
    const functionName = node.key.name

    if (isIgnored(functionName, ignoreList)) return

    if (!containsLoggingStatement(body)) {
      const correctLogging =
        filename === functionName ? filename : `${filename}:${functionName}`
      addMissingLogStatementSuggestions(context, node, body, correctLogging)
    }
  }
}

const isSetterLikeMethodDefinition = (
  node: TSESTree.MethodDefinition,
  functionName: string
) => {
  const { returnType } = node.value
  const returnsVoid =
    returnType === undefined ||
    returnType.typeAnnotation.type === "TSVoidKeyword"

  const startsWithSetterLikeName = new RegExp("^set[A-Z].*")
  const hasSetterLikeFunctionName = startsWithSetterLikeName.test(functionName)

  return hasSetterLikeFunctionName && returnsVoid
}

const checkMethodDefinition = (
  context: Readonly<TSESLint.RuleContext<messageIds, Options>>,
  node: TSESTree.MethodDefinition,
  ignoreList: string[]
) => {
  if (node.kind === "constructor") return
  if (node.kind === "get") return
  if (node.kind === "set") return

  if (isFunctionExpression(node.value) && isIdentifier(node.key)) {
    const { body } = node.value
    const filename = getClassName(context.getFilename())
    const functionName = node.key.name

    if (isSetterLikeMethodDefinition(node, functionName)) return
    if (isIgnored(functionName, ignoreList)) return

    if (!containsLoggingStatement(body)) {
      const correctLogging =
        filename === functionName ? filename : `${filename}:${functionName}`
      addMissingLogStatementSuggestions(context, node, body, correctLogging)
    }
  }
}

const noFunctionWithoutLogging = createRule<Options, messageIds>({
  create(context) {
    const ignoreList = context.options[0]?.ignoreList ?? []
    return {
      FunctionDeclaration: (node) => checkFunctionDeclaration(context, node, ignoreList),
      CallExpression: (node) => checkCallExpression(context, node, ignoreList),
      VariableDeclaration: (node) => checkVariableDeclaration(context, node, ignoreList),
      PropertyDefinition: (node) => checkPropertyDefinition(context, node, ignoreList),
      MethodDefinition: (node) => checkMethodDefinition(context, node, ignoreList),
    }
  },
  name: "no-function-without-logging",
  meta: {
    docs: {
      description: "All functions should include a logging statement",
    },
    messages: {
      incorrectLogging:
        "Logging should include the filename and function name: Log.debug('{{ expectedLogging }}')",
      missingLogging: "Functions should include at least one logging statement",
      addLoggingSuggestion:
        "Add '{{ suggestedCode }}' at beginning of block statement",
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
})

export const configs = {
  recommended: {
    plugins: ['observation'],
    rules: {
      'observation/no-function-without-logging': 'error',
    },
  },
}

export default noFunctionWithoutLogging
